import axios from "axios";
import type { AppConfig } from "../config/app.config.js";
import type { CameraRecognition } from "../queue/cameraSync/cameraSync.types.js";

type RecognizerResponse = {
  studentId?: string;
  confidence?: number;
  externalFaceId?: string;
  matches?: Array<{
    studentId: string;
    confidence: number;
    externalFaceId?: string;
  }>;
};

export class FaceRecognitionService {
  constructor(private readonly config: AppConfig["recognizer"]) {}

  async recognize(frame: unknown): Promise<CameraRecognition[]> {
    if (!this.config.url) return [];

    const { data } = await axios.post<RecognizerResponse>(this.config.url, frame, {
      timeout: this.config.timeoutMs,
    });

    const matches = data.matches ?? (
      data.studentId && typeof data.confidence === "number"
        ? [{
            studentId: data.studentId,
            confidence: data.confidence,
            externalFaceId: data.externalFaceId,
          }]
        : []
    );

    return matches
      .filter((match) => match.confidence >= this.config.minConfidence)
      .map((match) => ({
        studentId: match.studentId,
        confidence: match.confidence,
        externalFaceId: match.externalFaceId ?? null,
        capturedAt: new Date().toISOString(),
      }));
  }
}
