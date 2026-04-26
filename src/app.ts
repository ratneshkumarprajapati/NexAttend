//express stuff
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { trace } from "@opentelemetry/api";
import { API_BASE_PATH, CORS_ORIGINS } from "./config/constants.js";
import userRoutes from "./modules/user/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";

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

app.use(API_BASE_PATH, v1Router);

export default app;
