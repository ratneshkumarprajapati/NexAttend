import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { loadConfig } from "./config/app.config.js";
import { CameraController } from "./controllers/camera.controller.js";
import { RabbitCameraRecognitionPublisher } from "./queue/cameraSync/cameraRecognition.publisher.js";
import { createCameraRoutes } from "./routes/camera.routes.js";
import { CameraService } from "./services/camera.service.js";
import { FaceDetectionService } from "./services/faceDetection.service.js";
import { FaceEmbeddingRepository } from "./services/faceEmbedding.repository.js";
import { FaceEmbeddingService } from "./services/faceEmbedding.service.js";
import { FaceMatchService } from "./services/faceMatch.service.js";
import { FaceRecognitionService } from "./services/faceRecognition.service.js";
import { StudentEnrollmentService } from "./services/studentEnrollment.service.js";
import { requestLogger } from "./utils/logger.js";

export function appInit() {
  const config = loadConfig();
  const publisher = new RabbitCameraRecognitionPublisher(config.queue, config.camera);
  const faceDetector = new FaceDetectionService(config.faceDetection);
  const faceEmbeddingRepository = new FaceEmbeddingRepository(
    config.embeddings,
    config.mongodb,
  );
  const faceEmbeddingService = new FaceEmbeddingService(
    config.embeddings,
    faceDetector,
    faceEmbeddingRepository,
  );
  const enrollmentService = new StudentEnrollmentService(config.enrollment);
  const faceMatcher = new FaceMatchService(
    config.faceMatch,
    config.enrollment,
    enrollmentService,
  );
  const recognizer = new FaceRecognitionService(config.recognizer);
  const service = new CameraService(
    config.camera,
    faceDetector,
    faceEmbeddingService,
    faceMatcher,
    recognizer,
    publisher,
  );
  const controller = new CameraController(service);

  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(requestLogger);
  app.use(createCameraRoutes(controller));
  app.use(errorHandler);

  return { app, config, service, publisher };
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      details: error.flatten(),
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  res.status(500).json({ error: message });
};
