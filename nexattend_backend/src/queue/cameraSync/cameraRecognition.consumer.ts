import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import { env } from "../../config/env.js";
import { createModuleLogger } from "../../utils/logger.js";
import { cameraRecognitionProcessor } from "./cameraRecognition.processor.js";
import type { CameraRecognitionMessage } from "./cameraSync.types.js";

const logger = createModuleLogger("CameraRecognitionConsumer");

export class CameraRecognitionConsumer {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stopping = false;

  async start(): Promise<void> {
    if (!env.CAMERA_QUEUE.URL) {
      throw new Error("CLOUDAMQP_URL or AMQP_URL is required when CAMERA_QUEUE_ENABLED=true");
    }

    await this.connect();
  }

  async stop(): Promise<void> {
    this.stopping = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
    this.channel = null;
    this.connection = null;
  }

  private async connect(): Promise<void> {
    try {
      const connection = await amqp.connect(env.CAMERA_QUEUE.URL);
      this.connection = connection;
      connection.on("close", () => this.scheduleReconnect("connection closed"));
      connection.on("error", (error: Error) => {
        logger.error("AMQP connection error", error);
      });

      const channel = await connection.createChannel();
      this.channel = channel;
      channel.on("close", () => this.scheduleReconnect("channel closed"));
      channel.on("error", (error: Error) => {
        logger.error("AMQP channel error", error);
      });

      await channel.assertExchange(env.CAMERA_QUEUE.EXCHANGE, "direct", {
        durable: true,
      });
      await channel.assertQueue(env.CAMERA_QUEUE.RECOGNITION_QUEUE, {
        durable: true,
      });
      await channel.bindQueue(
        env.CAMERA_QUEUE.RECOGNITION_QUEUE,
        env.CAMERA_QUEUE.EXCHANGE,
        env.CAMERA_QUEUE.RECOGNITION_ROUTING_KEY,
      );
      await channel.prefetch(env.CAMERA_QUEUE.PREFETCH);

      await channel.consume(
        env.CAMERA_QUEUE.RECOGNITION_QUEUE,
        (message) => void this.handleMessage(message),
        { noAck: false },
      );

      logger.info("Started");
    } catch (error) {
      logger.error("Failed to start consumer", error);
      this.scheduleReconnect("connect failed");
    }
  }

  private async handleMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) return;

    try {
      const payload = JSON.parse(message.content.toString("utf8")) as CameraRecognitionMessage;
      this.validateMessage(payload);
      await cameraRecognitionProcessor.process(payload);
      this.channel.ack(message);
    } catch (error) {
      logger.error("Failed to process camera recognition message", error);
      this.channel.nack(message, false, false);
    }
  }

  private validateMessage(message: CameraRecognitionMessage): void {
    if (
      message.schemaVersion !== 1 ||
      message.source !== "camera-adapter" ||
      !message.camera?.id ||
      !message.recognition?.studentId ||
      typeof message.recognition.confidence !== "number" ||
      !message.recognition.capturedAt
    ) {
      throw new Error("Invalid camera recognition message");
    }
  }

  private scheduleReconnect(reason: string): void {
    if (this.stopping || this.reconnectTimer) return;

    logger.warn("Scheduling AMQP reconnect", { reason });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, env.CAMERA_QUEUE.RECONNECT_DELAY_MS);
  }
}

export const cameraRecognitionConsumer = new CameraRecognitionConsumer();
