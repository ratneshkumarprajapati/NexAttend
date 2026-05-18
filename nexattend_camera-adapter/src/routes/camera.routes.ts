import { Router } from "express";
import type { CameraController } from "../controllers/camera.controller.js";

export function createCameraRoutes(controller: CameraController): Router {
  const router = Router();

  router.get("/health", controller.health.bind(controller));
  router.get("/camera", controller.cameraPage.bind(controller));
  router.post("/detections", (req, res, next) => {
    void controller.createDetection(req, res).catch(next);
  });
  router.post("/capture", (req, res, next) => {
    void controller.capture(req, res).catch(next);
  });
  router.post("/detect", (req, res, next) => {
    void controller.detect(req, res).catch(next);
  });
  router.post("/faces/register", (req, res, next) => {
    void controller.registerFace(req, res).catch(next);
  });
  router.post("/faces/recognize", (req, res, next) => {
    void controller.recognizeFace(req, res).catch(next);
  });
  router.get("/faces/:studentId", (req, res, next) => {
    void controller.getRegisteredFace(req, res).catch(next);
  });
  router.post("/students/refresh", (req, res, next) => {
    void controller.refreshGallery(req, res).catch(next);
  });

  return router;
}
