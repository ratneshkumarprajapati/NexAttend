import { chromium, type Browser, type BrowserContext, type Frame, type Page } from "playwright";
import type { ScraperRouterConfig } from "../../config/router.config.js";
import type { ConnectedDevice, RouterAdapter, RouterDiagnostics } from "../router.adapter.js";
import { normalizeDevice, type RawDeviceLike } from "../../utils/device-normalizer.js";
import { retry } from "../../utils/async.js";
import { logger } from "../../utils/logger.js";

type ScrapedRouterRow = RawDeviceLike & {
  allocation?: string;
  lease?: string;
};

export class ScraperRouterAdapter implements RouterAdapter {
  public readonly key: string;
  public readonly name: string;
  public readonly type = "SCRAPER" as const;

  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;
  private inFlight: Promise<unknown> = Promise.resolve();
  private lastLoginAt?: string;
  private lastFetchAt?: string;
  private lastError?: string;

  constructor(private readonly config: ScraperRouterConfig) {
    this.key = config.key;
    this.name = config.name;
  }

  async login(): Promise<void> {
    await this.serialize(() => this.loginUnlocked());
  }

  async fetchConnectedDevices(): Promise<ConnectedDevice[]> {
    const raw = await this.fetchRawConnectedDevices();
    const devices = (raw as ScrapedRouterRow[])
      .map((device) => normalizeDevice(device, this))
      .filter((device): device is ConnectedDevice => Boolean(device));

    this.lastFetchAt = new Date().toISOString();
    return devices;
  }

  async fetchRawConnectedDevices(): Promise<ScrapedRouterRow[]> {
    return this.serialize(async () => {
      try {
        await this.ensureLoggedIn();
        const frame = await this.navigateToDevices();
        return await this.extractDevices(frame);
      } catch (error) {
        this.lastError = error instanceof Error ? error.message : String(error);
        await this.recoverPage();
        throw error;
      }
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.serialize(async () => {
        await this.ensurePage();
        const page = this.requirePage();
        await page.goto(this.config.baseUrl, {
          waitUntil: "domcontentloaded",
          timeout: this.config.timeoutMs
        });
        return true;
      });
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  getDiagnostics(): RouterDiagnostics {
    return {
      key: this.key,
      name: this.name,
      type: this.type,
      lastLoginAt: this.lastLoginAt,
      lastFetchAt: this.lastFetchAt,
      lastError: this.lastError,
      sessionActive: Boolean(this.browser?.isConnected() && this.page && !this.page.isClosed())
    };
  }

  async close(): Promise<void> {
    await this.browser?.close();
  }

  private async ensureLoggedIn(): Promise<void> {
    await this.ensurePage();
    const page = this.requirePage();

    try {
      await page.waitForSelector(this.config.selectors.loggedIn, { timeout: 3000 });
      return;
    } catch {
      await this.loginUnlocked();
    }
  }

  private async loginUnlocked(): Promise<void> {
    await this.ensurePage();
    const page = this.requirePage();

    await retry(
      async () => {
        await page.goto(new URL(this.config.loginPath, this.config.baseUrl).toString(), {
          waitUntil: "networkidle",
          timeout: this.config.timeoutMs
        });
        await page.fill(this.config.selectors.username, this.config.username, { timeout: this.config.timeoutMs });
        await page.fill(this.config.selectors.password, this.config.password, { timeout: this.config.timeoutMs });

        await Promise.all([
          page.waitForLoadState("networkidle", { timeout: this.config.timeoutMs }).catch(() => undefined),
          page.click(this.config.selectors.submit, { timeout: this.config.timeoutMs })
        ]);

        await page.waitForSelector(this.config.selectors.loggedIn, { timeout: this.config.timeoutMs });
        this.lastLoginAt = new Date().toISOString();
        this.lastError = undefined;
      },
      this.config.retry,
      (error, attempt) =>
        logger.warn("Scraper login retry", { context: "ScraperAdapter", routerKey: this.key, attempt, error })
    );
  }

  private async ensurePage(): Promise<void> {
    if (this.browser?.isConnected() && this.context && this.page && !this.page.isClosed()) {
      return;
    }

    this.browser = await chromium.launch({ headless: this.config.headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.goto(this.config.baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: this.config.timeoutMs
    });
  }

  private async navigateToDevices(): Promise<Frame> {
    const page = this.requirePage();

    await page.click(this.config.selectors.statusLink, { timeout: this.config.timeoutMs });
    await page.locator(this.config.selectors.localDevicesLink).click({ timeout: this.config.timeoutMs });

    const iframe = await page.waitForSelector(this.config.selectors.contentFrame, {
      timeout: this.config.timeoutMs
    });
    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error("Router content iframe was not available");
    }

    await frame.waitForSelector(this.config.selectors.readyText, { timeout: this.config.timeoutMs });
    return frame;
  }

  private async extractDevices(frame: Frame): Promise<ScrapedRouterRow[]> {
    const rows = await frame.$$eval(this.config.selectors.rows, (tableRows) =>
      tableRows.map((row) => {
        const columns = Array.from(row.querySelectorAll("td")).map((column) => column.textContent?.trim() ?? "");
        return {
          hostname: columns[0],
          interface: columns[1],
          ip: columns[2],
          mac: columns[3],
          allocation: columns[4],
          lease: columns[5]
        };
      })
    );

    return rows.filter((row) => row.mac && !/^mac$/i.test(row.mac));
  }

  private async recoverPage(): Promise<void> {
    try {
      await this.page?.close();
    } catch {
      // Best-effort recovery: a dead Playwright page should not kill the polling loop.
    }

    this.page = undefined;
    await this.ensurePage();
  }

  private requirePage(): Page {
    if (!this.page) {
      throw new Error("Scraper page has not been initialized");
    }
    return this.page;
  }

  private async serialize<T>(work: () => Promise<T>): Promise<T> {
    const run = this.inFlight.then(work, work);
    this.inFlight = run.catch(() => undefined);
    return run;
  }
}
