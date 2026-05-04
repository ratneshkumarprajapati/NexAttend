import type { RouterConfig } from "../config/router.config.js";
import type { RouterAdapter } from "./router.adapter.js";
import { ApiRouterAdapter } from "./api/api-router.adapter.js";
import { ScraperRouterAdapter } from "./scraper/scraper-router.adapter.js";

export function createRouterAdapter(config: RouterConfig): RouterAdapter {
  switch (config.type) {
    case "API":
      return new ApiRouterAdapter(config);
    case "SCRAPER":
      return new ScraperRouterAdapter(config);
  }
}

export function createRouterAdapters(configs: RouterConfig[]): RouterAdapter[] {
  return configs.filter((config) => config.enabled).map(createRouterAdapter);
}
