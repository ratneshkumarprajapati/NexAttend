import * as blazeface from "@tensorflow-models/blazeface";
import * as tf from "@tensorflow/tfjs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import type { AppConfig } from "../config/app.config.js";

export type ImageFrame = {
  imageBase64?: string;
  imageDataUrl?: string;
};

export type FaceDetection = {
  probability: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type BlazeFaceModel = Awaited<ReturnType<typeof blazeface.load>>;

export class FaceDetectionService {
  private model: Promise<BlazeFaceModel> | null = null;

  constructor(private readonly config: AppConfig["faceDetection"]) {}

  async detect(frame: ImageFrame): Promise<FaceDetection[]> {
    if (!this.config.enabled) return [];

    const image = decodeImageFrame(frame);
    const model = await this.loadModel();
    const input = tf.tensor3d(image.data, [image.height, image.width, 3], "int32");

    try {
      const predictions = await model.estimateFaces(input, false);

      return predictions
        .map((prediction) => toFaceDetection(prediction))
        .filter((face): face is FaceDetection => Boolean(face))
        .filter((face) => face.probability >= this.config.minProbability)
        .slice(0, this.config.maxFaces);
    } finally {
      input.dispose();
    }
  }

  private loadModel(): Promise<BlazeFaceModel> {
    this.model ??= blazeface.load();
    return this.model;
  }
}

export function decodeImageFrame(frame: ImageFrame): {
  data: Uint8Array;
  width: number;
  height: number;
} {
  const rawBase64 = frame.imageDataUrl
    ? frame.imageDataUrl.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, "")
    : frame.imageBase64;

  if (!rawBase64) {
    throw new Error("imageBase64 or imageDataUrl is required for face detection");
  }

  const buffer = Buffer.from(rawBase64, "base64");

  if (isPng(buffer)) {
    return decodePng(buffer);
  }

  return decodeJpeg(buffer);
}

function decodeJpeg(buffer: Buffer) {
  const image = jpeg.decode(buffer, { useTArray: true });
  return rgbaToRgb(image.data, image.width, image.height);
}

function decodePng(buffer: Buffer) {
  const image = PNG.sync.read(buffer);
  return rgbaToRgb(image.data, image.width, image.height);
}

function rgbaToRgb(
  data: Uint8Array | Buffer,
  width: number,
  height: number,
): {
  data: Uint8Array;
  width: number;
  height: number;
} {
  const rgb = new Uint8Array(width * height * 3);

  for (let source = 0, target = 0; source < data.length; source += 4, target += 3) {
    rgb[target] = data[source] ?? 0;
    rgb[target + 1] = data[source + 1] ?? 0;
    rgb[target + 2] = data[source + 2] ?? 0;
  }

  return { data: rgb, width, height };
}

function isPng(buffer: Buffer): boolean {
  return (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  );
}

function toFaceDetection(prediction: blazeface.NormalizedFace): FaceDetection | null {
  const probability = Array.isArray(prediction.probability)
    ? Number(prediction.probability[0] ?? 0)
    : Number(prediction.probability ?? 0);
  const topLeft = pointToArray(prediction.topLeft);
  const bottomRight = pointToArray(prediction.bottomRight);

  if (!topLeft || !bottomRight) return null;

  return {
    probability,
    box: {
      x: topLeft[0],
      y: topLeft[1],
      width: bottomRight[0] - topLeft[0],
      height: bottomRight[1] - topLeft[1],
    },
  };
}

function pointToArray(point: unknown): [number, number] | null {
  if (Array.isArray(point) && point.length >= 2) {
    return [Number(point[0]), Number(point[1])];
  }

  return null;
}
