import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import { env } from "../../config/env.js";
import { createModuleLogger } from "../../utils/logger.js";
import { routerSnapshotProcessor } from "./routerSnapshot.processor.js";
import type { RouterSnapshotMessage } from "./routerSync.types.js";

const logger = createModuleLogger("RouterSnapshotConsumer");

export class RouterSnapshotConsumer {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stopping = false;

  async start(): Promise<void> {
    if (!env.QUEUE.URL) {
      throw new Error("CLOUDAMQP_URL or AMQP_URL is required when ROUTER_SYNC_MODE=queue");
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
      const connection = await amqp.connect(env.QUEUE.URL);
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

      await channel.assertExchange(env.QUEUE.EXCHANGE, "direct", {
        durable: true,
      });
      await channel.assertQueue(env.QUEUE.SNAPSHOT_QUEUE, {
        durable: true,
      });
      await channel.bindQueue(
        env.QUEUE.SNAPSHOT_QUEUE,
        env.QUEUE.EXCHANGE,
        env.QUEUE.SNAPSHOT_ROUTING_KEY,
      );
      await channel.prefetch(env.QUEUE.PREFETCH);

      await channel.consume(
        env.QUEUE.SNAPSHOT_QUEUE,
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
      const payload = JSON.parse(message.content.toString("utf8")) as RouterSnapshotMessage;
      this.validateMessage(payload);
      await routerSnapshotProcessor.process(payload);
      this.channel.ack(message);
    } catch (error) {
      logger.error("Failed to process snapshot message", error);
      this.channel.nack(message, false, false);
    }
  }

  private validateMessage(message: RouterSnapshotMessage): void {
    if (
      message.schemaVersion !== 1 ||
      !message.snapshot ||
      !Array.isArray(message.snapshot.devices) ||
      !Array.isArray(message.snapshot.failures)
    ) {
      throw new Error("Invalid router snapshot message");
    }
  }

  private scheduleReconnect(reason: string): void {
    if (this.stopping || this.reconnectTimer) return;

    logger.warn("Scheduling AMQP reconnect", { reason });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, env.QUEUE.RECONNECT_DELAY_MS);
  }
}

export const routerSnapshotConsumer = new RouterSnapshotConsumer();
