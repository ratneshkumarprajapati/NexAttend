export interface CameraRecognition {
  studentId: string;
  confidence: number;
  externalFaceId?: string | null;
  frameId?: string | null;
  capturedAt: string;
}

export interface CameraRecognitionMessage {
  id: string;
  source: "camera-adapter";
  schemaVersion: 1;
  publishedAt: string;
  camera: {
    id: string;
    name: string;
    location?: string;
  };
  recognition: CameraRecognition;
}

export interface CameraRecognitionPublisher {
  publishRecognition(recognition: CameraRecognition): Promise<void>;
  close(): Promise<void>;
}
