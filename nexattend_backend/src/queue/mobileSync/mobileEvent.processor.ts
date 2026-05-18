import { eventBus } from "../../events/eventBus.js";
import { prisma } from "../../services/prisma/prisma.client.js";
import { hashMac } from "../../utils/hash.util.js";
import { createModuleLogger } from "../../utils/logger.js";
import type { MobileDeviceEventMessage } from "./mobileSync.types.js";

const logger = createModuleLogger("MobileEventProcessor");

export class MobileEventProcessor {
  async process(message: MobileDeviceEventMessage): Promise<void> {
    const event = message.event;
    const emailId = event.emailId.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email: emailId,
        role: "STUDENT",
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            phoneNo: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn("Mobile event for unknown student", {
        emailId,
        adapterId: message.adapter.id,
      });
      return;
    }

    const device = await this.ensureMobileDevice(
      user.id,
      emailId,
      event.deviceName,
      user.profile?.phoneNo ?? event.phoneNo,
    );
    const timestamp = toDate(event.occurredAt);

    if (event.event === "disconnected") {
      eventBus.emit("attendance:disconnected", {
        userId: user.id,
        deviceId: device.id,
        timestamp,
        source: "mobile",
        emailId,
        adapterId: message.adapter.id,
      });
    } else {
      eventBus.emit("attendance:seen", {
        userId: user.id,
        deviceId: device.id,
        timestamp,
        source: "mobile",
        emailId,
        adapterId: message.adapter.id,
      });
    }

    logger.info("Mobile attendance event emitted", {
      event: event.event,
      emailId,
      adapterId: message.adapter.id,
    });
  }

  private async ensureMobileDevice(
    userId: string,
    emailId: string,
    deviceName?: string,
    phoneNo?: string | null,
  ) {
    const hashedMac = hashMac(`mobile:${emailId}`);
    const existing = await prisma.device.findUnique({
      where: { hashedMac },
    });

    if (existing) {
      if (phoneNo && existing.phoneNo !== phoneNo) {
        return prisma.device.update({
          where: { id: existing.id },
          data: { phoneNo },
        });
      }

      return existing;
    }

    return prisma.device.create({
      data: {
        userId,
        deviceName: deviceName ?? `Mobile: ${emailId}`,
        hashedMac,
        phoneNo: phoneNo ?? null,
      },
    });
  }
}

function toDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export const mobileEventProcessor = new MobileEventProcessor();
