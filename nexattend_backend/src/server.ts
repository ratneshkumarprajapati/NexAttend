import app, { startAppWorkers } from "./app.js";
import { connectDB, registerDBShutdownHandlers } from "./config/db.js";
import { env } from "./config/env.js";
import { registerTelemetryShutdownHandlers } from "./instrumentation/otel.js";
import { createModuleLogger } from "./utils/logger.js";

const logger = createModuleLogger("Server");

try {
  await connectDB();
  registerDBShutdownHandlers();
  registerTelemetryShutdownHandlers();
  startAppWorkers()
  app.listen(env.PORT, () => {
    logger.info(
      `${env.APP_NAME} server is running on port ${env.PORT} in ${env.NODE_ENV} mode`,
    );
  });
} catch (error) {
  logger.error("Failed to start server", error);
  process.exit(1);
}
