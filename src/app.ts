//express stuff
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CORS_ORIGINS } from "./config/constants.js";
import userRoutes from "./modules/user/user.routes.js";

const app = express();

app.use(
  cors({
    origin: [...CORS_ORIGINS],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);

export default app;
