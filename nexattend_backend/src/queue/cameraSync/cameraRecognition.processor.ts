import { eventBus } from "../../events/eventBus.js";
import { prisma } from "../../services/prisma/prisma.client.js";
import { hashMac } from "../../utils/hash.util.js";
import { createModuleLogger } from "../../utils/logger.js";
import { env } from "../../config/env.js";
import type { CameraRecognitionMessage } from "./cameraSync.types.js";

const logger = createModuleLogger("CameraRecognitionProcessor");

export class CameraRecognitionProcessor {
  async process(message: CameraRecognitionMessage): Promise<void> {
    const { recognition, camera } = message;

    if (recognition.confidence < env.CAMERA_QUEUE.MIN_CONFIDENCE) {
      logger.warn("Ignoring low confidence camera recognition", {
        studentId: recognition.studentId,
        confidence: recognition.confidence,
        cameraId: camera.id,
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: recognition.studentId,
        role: "STUDENT",
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!user) {
      logger.warn("Camera recognition for unknown student", {
        studentId: recognition.studentId,
        cameraId: camera.id,
      });
      return;
    }

    const device = await this.ensureCameraDevice(user.id, camera);
    const timestamp = new Date(recognition.capturedAt);

    eventBus.emit("attendance:seen", {
      userId: user.id,
      deviceId: device.id,
      timestamp: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
      source: "camera",
      confidence: recognition.confidence,
      cameraId: camera.id,
    });

    logger.info("Camera attendance sighting emitted", {
      studentId: user.id,
      cameraId: camera.id,
      confidence: recognition.confidence,
    });
  }

  private async ensureCameraDevice(
    userId: string,
    camera: CameraRecognitionMessage["camera"],
  ) {
    const hashedMac = hashMac(`camera:${camera.id}:${userId}`);
    const existing = await prisma.device.findUnique({
      where: { hashedMac },
    });

    if (existing) return existing;

    return prisma.device.create({
      data: {
        userId,
        deviceName: `Camera: ${camera.name}`,
        hashedMac,
      },
    });
  }
}

export const cameraRecognitionProcessor = new CameraRecognitionProcessor();
