import { Router } from "express";
import { RouterController } from "../controllers/router.controller.js";

export function createRouterRoutes(controller: RouterController): Router {
  const router = Router();

  router.get("/devices", controller.devices);
  router.get("/health", controller.health);
  router.get("/routers/status", controller.status);
  router.get("/debug/raw", controller.raw);

  return router;
}
