import type { Request, Response } from "express";
import { z } from "zod";
import type { CameraService } from "../services/camera.service.js";

const ManualDetectionSchema = z.object({
  studentId: z.string().min(1),
  confidence: z.number().min(0).max(1),
  externalFaceId: z.string().optional().nullable(),
  frameId: z.string().optional().nullable(),
  capturedAt: z.string().datetime().optional(),
});

const ImageFrameSchema = z.object({
  imageBase64: z.string().optional(),
  imageDataUrl: z.string().optional(),
}).refine((value) => value.imageBase64 || value.imageDataUrl, {
  message: "imageBase64 or imageDataUrl is required",
});

const FaceRegistrationSchema = ImageFrameSchema.and(z.object({
  studentId: z.string().min(1),
  userId: z.string().min(1).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
}));

const FaceRecognitionSchema = ImageFrameSchema.and(z.object({
  publish: z.boolean().optional().default(false),
}));

export class CameraController {
  constructor(private readonly service: CameraService) {}

  health(_req: Request, res: Response): void {
    res.json({ ok: true, service: "nexattend-camera-adapter" });
  }

  cameraPage(_req: Request, res: Response): void {
    res.type("html").send(cameraPageHtml);
  }

  async createDetection(req: Request, res: Response): Promise<void> {
    const input = ManualDetectionSchema.parse(req.body);
    await this.service.publishManualRecognition(input);
    res.status(202).json({ accepted: true });
  }

  async capture(req: Request, res: Response): Promise<void> {
    const frame = ImageFrameSchema.parse(req.body);
    const result = await this.service.captureAndPublish(frame);
    res.status(202).json({ accepted: true, ...result });
  }

  async detect(req: Request, res: Response): Promise<void> {
    const frame = ImageFrameSchema.parse(req.body);
    const faces = await this.service.detectFaces(frame);
    res.json({ facesDetected: faces.length, faces });
  }

  async refreshGallery(_req: Request, res: Response): Promise<void> {
    const count = await this.service.refreshFaceGallery();
    res.json({ indexedStudents: count });
  }

  async registerFace(req: Request, res: Response): Promise<void> {
    const input = FaceRegistrationSchema.parse(req.body);
    const result = await this.service.registerFace(input);
    res.status(201).json(result);
  }

  async recognizeFace(req: Request, res: Response): Promise<void> {
    const input = FaceRecognitionSchema.parse(req.body);
    const result = await this.service.recognizeFrame(input, input.publish);
    res.status(input.publish ? 202 : 200).json(result);
  }

  async getRegisteredFace(req: Request, res: Response): Promise<void> {
    const studentId = z.string().min(1).parse(req.params.studentId);
    const record = await this.service.getRegisteredFace(studentId);

    if (!record) {
      res.status(404).json({ error: "Face embedding not found" });
      return;
    }

    res.json(record);
  }
}

const cameraPageHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NexAttend Camera Adapter</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #10141b;
      color: #edf2f7;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }
    header {
      padding: 16px 20px;
      border-bottom: 1px solid #263244;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    h1 {
      font-size: 18px;
      margin: 0;
      font-weight: 650;
    }
    main {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: 20px;
      padding: 20px;
    }
    video, canvas {
      width: 100%;
      max-height: calc(100vh - 128px);
      background: #05070a;
      border: 1px solid #263244;
      border-radius: 8px;
      object-fit: contain;
    }
    aside {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    button {
      border: 0;
      border-radius: 7px;
      background: #2f81f7;
      color: white;
      font: inherit;
      font-weight: 650;
      padding: 11px 14px;
      cursor: pointer;
    }
    button.secondary {
      background: #263244;
    }
    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .panel {
      border: 1px solid #263244;
      border-radius: 8px;
      padding: 14px;
      background: #151b25;
    }
    .label {
      color: #a9b6c8;
      font-size: 12px;
      margin-bottom: 6px;
    }
    .value {
      font-size: 24px;
      font-weight: 700;
    }
    pre {
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #cbd5e1;
    }
    @media (max-width: 840px) {
      main {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>NexAttend Camera Adapter</h1>
    <span id="status">Idle</span>
  </header>
  <main>
    <section>
      <video id="video" autoplay playsinline muted></video>
      <canvas id="canvas" hidden></canvas>
    </section>
    <aside>
      <button id="start">Start Camera</button>
      <button id="stop" class="secondary" disabled>Stop Camera</button>
      <button id="capture" class="secondary" disabled>Capture Once</button>
      <div class="panel">
        <div class="label">Faces Detected</div>
        <div class="value" id="faces">0</div>
      </div>
      <div class="panel">
        <div class="label">Last Response</div>
        <pre id="output">{}</pre>
      </div>
    </aside>
  </main>
  <script>
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const startButton = document.getElementById("start");
    const stopButton = document.getElementById("stop");
    const captureButton = document.getElementById("capture");
    const statusText = document.getElementById("status");
    const facesText = document.getElementById("faces");
    const output = document.getElementById("output");

    let stream = null;
    let timer = null;
    let busy = false;

    startButton.addEventListener("click", startCamera);
    stopButton.addEventListener("click", stopCamera);
    captureButton.addEventListener("click", () => detectFrame());

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = stream;
        statusText.textContent = "Camera running";
        startButton.disabled = true;
        stopButton.disabled = false;
        captureButton.disabled = false;
        timer = window.setInterval(detectFrame, 2500);
      } catch (error) {
        statusText.textContent = "Camera blocked or unavailable";
        output.textContent = JSON.stringify({ error: error.message }, null, 2);
      }
    }

    function stopCamera() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      video.srcObject = null;
      startButton.disabled = false;
      stopButton.disabled = true;
      captureButton.disabled = true;
      statusText.textContent = "Stopped";
    }

    async function detectFrame() {
      if (!stream || busy || video.videoWidth === 0) return;

      busy = true;
      statusText.textContent = "Detecting...";

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.82);

        const response = await fetch("/capture", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageDataUrl })
        });
        const data = await response.json();
        facesText.textContent = String(data.facesDetected || 0);
        output.textContent = JSON.stringify(data, null, 2);
        statusText.textContent = response.ok ? "Camera running" : "Detection failed";
      } catch (error) {
        statusText.textContent = "Detection failed";
        output.textContent = JSON.stringify({ error: error.message }, null, 2);
      } finally {
        busy = false;
      }
    }
  </script>
</body>
</html>`;
