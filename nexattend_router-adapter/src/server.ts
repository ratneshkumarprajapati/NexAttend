import { appInit } from "./app.js";
import { logger } from "./utils/logger.js";

const { app, service, config, adapters, syncPublisher } = appInit();

const server = app.listen(config.port, () => {
  logger.info("Router microservice listening", { context: "Server", port: config.port });
  service.start();
});

async function shutdown(signal: string): Promise<void> {
  logger.info("Shutting down router microservice", { context: "Server", signal });
  service.stop();
  await syncPublisher?.close();
  await Promise.allSettled(adapters.map((adapter) => adapter.close?.()));
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
