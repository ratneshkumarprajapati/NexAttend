import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { loadConfig } from "./config/app.config.js";
import { MobileController } from "./controllers/mobile.controller.js";
import { RabbitMobileEventPublisher } from "./queue/mobileSync/mobileEvent.publisher.js";
import { createMobileRoutes } from "./routes/mobile.routes.js";
import { MobileEventService } from "./services/mobileEvent.service.js";
import { requestLogger } from "./utils/logger.js";

export function appInit() {
  const config = loadConfig();
  const publisher = new RabbitMobileEventPublisher(config.queue, config.mobile);
  const service = new MobileEventService(
    config.mobile.aggregationWindowMs,
    publisher,
  );
  const controller = new MobileController(service);

  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use(createMobileRoutes(controller));
  app.use(errorHandler);

  return { app, config, service, publisher };
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      details: error.flatten(),
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  res.status(500).json({ error: message });
};
