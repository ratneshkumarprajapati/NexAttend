import { RouterAggregator } from "../aggregator/router.aggregator.js";
import { RouterCache } from "../cache/router.cache.js";
import type { RouterHealth, RouterDiagnostics } from "../adapters/router.adapter.js";
import { logger } from "../utils/logger.js";

export class RouterService {
  private timer?: NodeJS.Timeout;
  private polling = false;

  constructor(
    private readonly aggregator: RouterAggregator,
    private readonly cache: RouterCache,
    private readonly pollIntervalMs: number
  ) {}

  start(): void {
    void this.pollOnce();
    this.timer = setInterval(() => void this.pollOnce(), this.pollIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  getDevices() {
    return this.cache.get();
  }

  async getHealth(): Promise<RouterHealth[]> {
    return this.aggregator.health();
  }

  getRouterStatus(): RouterDiagnostics[] {
    return this.aggregator.diagnostics();
  }

  async getRaw(routerKey: string): Promise<unknown> {
    return this.aggregator.raw(routerKey);
  }

  private async pollOnce(): Promise<void> {
    if (this.polling) {
      logger.warn("Skipping router poll because previous poll is still running", { context: "Poller" });
      return;
    }

    this.polling = true;
    try {
      const snapshot = await this.aggregator.fetchAllDevices();
      this.cache.set(snapshot);
      logger.info(`Devices received: ${snapshot.devices.length}`, { context: "Poller" });
    } catch (error) {
      logger.error("Router polling failed unexpectedly", { context: "Poller", error });
    } finally {
      this.polling = false;
    }
  }
}
