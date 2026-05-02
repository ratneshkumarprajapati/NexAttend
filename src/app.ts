//express stuff
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { trace } from "@opentelemetry/api";
import { API_BASE_PATH, CORS_ORIGINS } from "./config/constants.js";
import userRoutes from "./modules/user/routes/user.routes.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import profileRoutes from "./modules/profile/routes/profile.routes.js";
import deviceRoutes from "./modules/device/routes/device.routes.js"
import accessPointRoutes from "./modules/accesspoint/routes/accesspoint.routes.js";
import { poller } from "./jobs/routerPoller.job.js";
import { logDumpJob } from "./jobs/logDump.job.js";
import { initPresenceModule } from "./modules/presence/init/presence.init.js";
import { initAttendanceModule } from "./modules/attendance/init/attendance.init.js";
import { initAIModule } from "./modules/ai/Init/ai.init.js";

const app = express();

app.use(
  cors({
    origin: [...CORS_ORIGINS],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const activeSpan = trace.getActiveSpan();
  const traceId = activeSpan?.spanContext().traceId;

  if (traceId) {
    res.setHeader("x-trace-id", traceId);
  }

  next();
});

const v1Router = express.Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/profiles", profileRoutes);
v1Router.use("/devices", deviceRoutes);
v1Router.use("/access-points", accessPointRoutes);

app.use(API_BASE_PATH, v1Router);

poller.start();
logDumpJob.start();
initPresenceModule();
initAttendanceModule();
initAIModule()
// console.table(await routerService.fetchConnectedDevices());
export default app;
