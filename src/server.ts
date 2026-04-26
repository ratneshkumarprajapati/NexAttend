import app from "./app.js";
import { connectDB, registerDBShutdownHandlers } from "./config/db.js";
import { env } from "./config/env.js";
import { registerTelemetryShutdownHandlers } from "./instrumentation/otel.js";
import logger from "./utils/logger.js";

try {
  await connectDB();
  registerDBShutdownHandlers();
  registerTelemetryShutdownHandlers();

  app.listen(env.PORT, () => {
    logger.info(
      `${env.APP_NAME} server is running on port ${env.PORT} in ${env.NODE_ENV} mode`,
    );
  });
} catch (error) {
  logger.error("Failed to start server", error);
  process.exit(1);
}
