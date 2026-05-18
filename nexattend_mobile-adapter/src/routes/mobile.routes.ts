import { Router } from "express";
import type { MobileController } from "../controllers/mobile.controller.js";

export function createMobileRoutes(controller: MobileController): Router {
  const router = Router();

  router.get("/health", controller.health);
  router.post("/webhooks/mobile/device-events", controller.deviceEvent);

  return router;
}
