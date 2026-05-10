import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { loadConfig } from "./config/app.config.js";
import { createRouterAdapters } from "./adapters/router.factory.js";
import { RouterAggregator } from "./aggregator/router.aggregator.js";
import { RouterCache } from "./cache/router.cache.js";
import { RouterService } from "./services/router.service.js";
import { RouterController } from "./controllers/router.controller.js";
import { createRouterRoutes } from "./routes/router.routes.js";
import { RabbitRouterSyncPublisher } from "./queue/routerSync/routerSnapshot.publisher.js";
import { requestLogger } from "./utils/logger.js";

export function appInit() {
  const config = loadConfig();
  const adapters = createRouterAdapters(config.routers);
  const aggregator = new RouterAggregator(adapters);
  const cache = new RouterCache();
  const syncPublisher = config.queue.enabled
    ? new RabbitRouterSyncPublisher(config.queue)
    : undefined;
  const service = new RouterService(
    aggregator,
    cache,
    config.pollIntervalMs,
    syncPublisher,
  );
  const controller = new RouterController(service);

  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use(createRouterRoutes(controller));
  app.use(errorHandler);

  return { app, service, config, adapters, syncPublisher };
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      details: error.flatten()
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = /unknown routerKey/i.test(message) ? 404 : 500;
  res.status(status).json({ error: message });
};
