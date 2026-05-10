import amqp, { type ChannelModel, type ConfirmChannel } from "amqplib";
import type { AppConfig } from "../../config/app.config.js";
import { logger } from "../../utils/logger.js";
import type { AggregatedDevices } from "../../aggregator/router.aggregator.js";
import type {
  QueueConnectedDevice,
  RouterSnapshotMessage,
  RouterSyncPublisher,
} from "./routerSync.types.js";

export class RabbitRouterSyncPublisher implements RouterSyncPublisher {
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private connecting: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stopping = false;

  constructor(private readonly config: AppConfig["queue"]) {}

  async publishSnapshot(snapshot: AggregatedDevices): Promise<void> {
    if (!this.config.enabled) return;
    if (!this.config.url) {
      throw new Error("CLOUDAMQP_URL or AMQP_URL is required when queue publishing is enabled");
    }

    await this.ensureChannel();

    const payload = this.createPayload(snapshot);
    const body = Buffer.from(JSON.stringify(payload));
    const published = this.channel!.publish(
      this.config.exchange,
      this.config.snapshotRoutingKey,
      body,
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
    logger.info("Published router snapshot", {
      context: "RouterSyncPublisher",
      devices: payload.snapshot.devices.length,
      failures: payload.snapshot.failures.length,
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
    try {
      const connection = await amqp.connect(this.config.url);
      this.connection = connection;
      connection.on("close", () => this.handleDisconnect("connection closed"));
      connection.on("error", (error: Error) => {
        logger.error("AMQP connection error", { context: "RouterSyncPublisher", error });
      });

      const channel = await connection.createConfirmChannel();
      this.channel = channel;
      channel.on("close", () => this.handleDisconnect("channel closed"));
      channel.on("error", (error: Error) => {
        logger.error("AMQP channel error", { context: "RouterSyncPublisher", error });
      });

      await channel.assertExchange(this.config.exchange, "direct", {
        durable: true,
      });

      logger.info("AMQP publisher ready", { context: "RouterSyncPublisher" });
    } catch (error) {
      this.channel = null;
      this.connection = null;
      logger.error("Failed to connect AMQP publisher", {
        context: "RouterSyncPublisher",
        error,
      });
      throw error;
    }
  }

  private handleDisconnect(reason: string): void {
    if (this.stopping) return;

    this.channel = null;
    this.connection = null;

    if (this.reconnectTimer) return;

    logger.warn("Scheduling AMQP publisher reconnect", {
      context: "RouterSyncPublisher",
      reason,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.ensureChannel().catch(() => undefined);
    }, this.config.reconnectDelayMs);
  }

  private createPayload(snapshot: AggregatedDevices): RouterSnapshotMessage {
    const publishedAt = new Date().toISOString();

    return {
      id: `${publishedAt}-${Math.random().toString(36).slice(2)}`,
      source: "router-adapter",
      schemaVersion: 1,
      publishedAt,
      snapshot: {
        devices: snapshot.devices.map(toQueueDevice),
        failures: snapshot.failures,
        timestamp: snapshot.timestamp,
      },
    };
  }
}

function toQueueDevice(device: AggregatedDevices["devices"][number]): QueueConnectedDevice {
  return {
    mac: String(device.mac ?? "").toLowerCase(),
    ip: String(device.ip ?? ""),
    hostname: toStringOrNull(device.hostname),
    manufacturer: toStringOrNull(device.manufacturer),
    connection: {
      band: String(device.connection?.band ?? device.connection?.interface ?? ""),
      rssi: toNumber(device.connection?.rssi),
      txRate: toNumber(device.connection?.txRate),
      rxRate: toNumber(device.connection?.rxRate),
    },
    session: {
      duration: 0,
      expireTime: 0,
    },
    meta: {
      routerKey: String(device.meta?.routerKey ?? "router-adapter"),
      routerName: String(device.meta?.routerName ?? "Router Adapter"),
      routerProvider: String(
        device.meta?.routerProvider ?? device.meta?.routerType ?? "router-adapter",
      ),
      ssidIndex: toNumber(device.meta?.ssidIndex),
      iid: toNumber(device.meta?.iid),
    },
    source: "router",
  };
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}
