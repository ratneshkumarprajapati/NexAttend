import { logger } from "../utils/logger.js";
import type {
  MobileDeviceEvent,
  MobileDeviceEventType,
  MobileEventPublisher,
} from "../queue/mobileSync/mobileSync.types.js";

export interface IncomingMobileEvent {
  event: MobileDeviceEventType;
  emailId: string;
  deviceId?: string;
  deviceName?: string;
  phoneNo?: string;
  ip?: string;
  platform?: string;
  appVersion?: string;
  batteryLevel?: number;
  networkType?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  occurredAt?: Date;
}

export class MobileEventService {
  private readonly eventsByEmail = new Map<string, MobileDeviceEvent>();
  private readonly timersByEmail = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly aggregationWindowMs: number,
    private readonly publisher: MobileEventPublisher,
  ) {}

  async acceptEvent(event: IncomingMobileEvent): Promise<MobileDeviceEvent> {
    const normalized = this.normalizeEvent(event);
    const existing = this.eventsByEmail.get(normalized.emailId);
    const aggregated = existing ? this.mergeEvents(existing, normalized) : normalized;

    this.eventsByEmail.set(aggregated.emailId, aggregated);

    if (this.aggregationWindowMs === 0 || aggregated.event === "disconnected") {
      await this.flushEmail(aggregated.emailId);
      return aggregated;
    }

    this.scheduleFlush(aggregated.emailId);
    return aggregated;
  }

  async stop(): Promise<void> {
    for (const timer of this.timersByEmail.values()) {
      clearTimeout(timer);
    }
    this.timersByEmail.clear();

    for (const emailId of [...this.eventsByEmail.keys()]) {
      await this.flushEmail(emailId);
    }
  }

  private scheduleFlush(emailId: string): void {
    const existing = this.timersByEmail.get(emailId);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.timersByEmail.delete(emailId);
      void this.flushEmail(emailId).catch((error) => {
        logger.error("Failed to publish aggregated mobile event", {
          context: "MobileEventService",
          emailId,
          error,
        });
      });
    }, this.aggregationWindowMs);

    this.timersByEmail.set(emailId, timer);
  }

  private async flushEmail(emailId: string): Promise<void> {
    const event = this.eventsByEmail.get(emailId);
    if (!event) return;

    const timer = this.timersByEmail.get(emailId);
    if (timer) {
      clearTimeout(timer);
      this.timersByEmail.delete(emailId);
    }

    this.eventsByEmail.delete(emailId);
    await this.publisher.publishEvent(event);
  }

  private normalizeEvent(event: IncomingMobileEvent): MobileDeviceEvent {
    const now = new Date();
    const occurredAt = event.occurredAt ?? now;

    return {
      event: event.event,
      emailId: event.emailId.trim().toLowerCase(),
      deviceId: event.deviceId,
      deviceName: event.deviceName,
      phoneNo: event.phoneNo?.trim() || undefined,
      ip: event.ip,
      platform: event.platform,
      appVersion: event.appVersion,
      batteryLevel: event.batteryLevel,
      networkType: event.networkType,
      latitude: event.latitude,
      longitude: event.longitude,
      accuracyMeters: event.accuracyMeters,
      occurredAt: occurredAt.toISOString(),
      receivedAt: now.toISOString(),
    };
  }

  private mergeEvents(
    existing: MobileDeviceEvent,
    next: MobileDeviceEvent,
  ): MobileDeviceEvent {
    return {
      ...existing,
      ...next,
      event: next.event,
      receivedAt: next.receivedAt,
      occurredAt: next.occurredAt,
    };
  }
}
