import amqp, { type ChannelModel, type ConfirmChannel } from "amqplib";
import type { AppConfig } from "../../config/app.config.js";
import { logger } from "../../utils/logger.js";
import type {
  MobileDeviceEvent,
  MobileDeviceEventMessage,
  MobileEventPublisher,
} from "./mobileSync.types.js";

export class RabbitMobileEventPublisher implements MobileEventPublisher {
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private connecting: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stopping = false;

  constructor(
    private readonly queueConfig: AppConfig["queue"],
    private readonly mobileConfig: AppConfig["mobile"],
  ) {}

  async publishEvent(event: MobileDeviceEvent): Promise<void> {
    if (!this.queueConfig.enabled) return;
    if (!this.queueConfig.url) {
      throw new Error("CLOUDAMQP_URL or AMQP_URL is required when mobile queue publishing is enabled");
    }

    await this.ensureChannel();

    const payload = this.createPayload(event);
    const published = this.channel!.publish(
      this.queueConfig.exchange,
      this.queueConfig.eventRoutingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        contentType: "application/json",
        deliveryMode: 2,
        messageId: payload.id,
        timestamp: Date.now(),
      },
    );

    if (!published) {
      await new Promise<void>((resolve) => this.channel!.once("drain", resolve));
    }

    await this.channel!.waitForConfirms();
    logger.info("Published mobile device event", {
      context: "MobileEventPublisher",
      event: event.event,
      emailId: event.emailId,
    });
  }

  async close(): Promise<void> {
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

  private async ensureChannel(): Promise<void> {
    if (this.channel) return;
    if (this.connecting) return this.connecting;

    this.connecting = this.connect();
    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  private async connect(): Promise<void> {
    const connection = await amqp.connect(this.queueConfig.url);
    this.connection = connection;
    connection.on("close", () => this.handleDisconnect("connection closed"));
    connection.on("error", (error: Error) => {
      logger.error("AMQP connection error", { context: "MobileEventPublisher", error });
    });

    const channel = await connection.createConfirmChannel();
    this.channel = channel;
    channel.on("close", () => this.handleDisconnect("channel closed"));
    channel.on("error", (error: Error) => {
      logger.error("AMQP channel error", { context: "MobileEventPublisher", error });
    });

    await channel.assertExchange(this.queueConfig.exchange, "direct", {
      durable: true,
    });

    logger.info("AMQP mobile publisher ready", { context: "MobileEventPublisher" });
  }

  private handleDisconnect(reason: string): void {
    if (this.stopping) return;

    this.channel = null;
    this.connection = null;

    if (this.reconnectTimer) return;

    logger.warn("Scheduling AMQP publisher reconnect", {
      context: "MobileEventPublisher",
      reason,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.ensureChannel().catch(() => undefined);
    }, this.queueConfig.reconnectDelayMs);
  }

  private createPayload(event: MobileDeviceEvent): MobileDeviceEventMessage {
    const publishedAt = new Date().toISOString();

    return {
      id: `${publishedAt}-${Math.random().toString(36).slice(2)}`,
      source: "mobile-adapter",
      schemaVersion: 1,
      publishedAt,
      adapter: {
        id: this.mobileConfig.id,
        name: this.mobileConfig.name,
      },
      event,
    };
  }
}
