//express stuff
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { trace } from "@opentelemetry/api";
import { API_BASE_PATH, CORS_ORIGINS } from "./config/constants.js";
import userRoutes from "./modules/user/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import deviceRoutes from "./modules/device/device.routes.js"
import { routerService } from "./services/router/router.service.js";
import { poller } from "./jobs/routerPoller.job.js";

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

app.use(API_BASE_PATH, v1Router);

poller.start()
// console.table(await routerService.fetchConnectedDevices())
export default app;
