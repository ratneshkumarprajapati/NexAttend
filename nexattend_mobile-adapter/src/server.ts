import { ZodError } from "zod";
import { appInit } from "./app.js";
import { logger } from "./utils/logger.js";

let bootstrap: ReturnType<typeof appInit>;

try {
  bootstrap = appInit();
} catch (error) {
  logger.error("Mobile adapter failed to start", {
    context: "Server",
    error: getStartupErrorMessage(error),
  });
  process.exit(1);
}

const { app, config, service, publisher } = bootstrap;

const server = app.listen(config.port, () => {
  logger.info("Mobile adapter listening", {
    context: "Server",
    port: config.port,
    adapterId: config.mobile.id,
  });
});

async function shutdown(signal: string): Promise<void> {
  logger.info("Shutting down mobile adapter", { context: "Server", signal });
  await service.stop();
  await publisher.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

function getStartupErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join("; ");
  }

  return error instanceof Error ? error.message : "Unexpected startup error";
}
