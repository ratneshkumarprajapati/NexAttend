import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { MobileEventService } from "../services/mobileEvent.service.js";

const MobileWebhookSchema = z
  .object({
    event: z.enum([
      "detected",
      "device_detected",
      "connected",
      "device_connected",
      "disconnected",
      "device_disconnected",
      "heartbeat",
    ]),
    email: z.string().email().optional(),
    emailId: z.string().email().optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    phoneNo: z.string().trim().min(1).optional(),
    ip: z.string().optional(),
    ipAddress: z.string().optional(),
    platform: z.string().optional(),
    appVersion: z.string().optional(),
    batteryLevel: z.coerce.number().min(0).max(100).optional(),
    networkType: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    accuracyMeters: z.coerce.number().nonnegative().optional(),
    timestamp: z.coerce.date().optional(),
    occurredAt: z.coerce.date().optional(),
  })
  .transform((payload, ctx) => {
    const emailId = payload.emailId ?? payload.email;
    if (!emailId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "email or emailId is required",
        path: ["emailId"],
      });
      return z.NEVER;
    }

    return {
      event: normalizeMobileEvent(payload.event),
      emailId,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      phoneNo: payload.phoneNo,
      ip: payload.ip ?? payload.ipAddress,
      platform: payload.platform,
      appVersion: payload.appVersion,
      batteryLevel: payload.batteryLevel,
      networkType: payload.networkType,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracyMeters: payload.accuracyMeters,
      occurredAt: payload.occurredAt ?? payload.timestamp,
    };
  });

export class MobileController {
  constructor(private readonly service: MobileEventService) {}

  health = (_req: Request, res: Response): void => {
    res.json({ status: "ok" });
  };

  deviceEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const event = MobileWebhookSchema.parse(req.body);
      const aggregated = await this.service.acceptEvent(event);

      res.json({
        status: "accepted",
        event: aggregated.event,
        emailId: aggregated.emailId,
        phoneNo: aggregated.phoneNo,
        occurredAt: aggregated.occurredAt,
        receivedAt: aggregated.receivedAt,
      });
    } catch (error) {
      next(error);
    }
  };
}

function normalizeMobileEvent(
  event: string,
): "detected" | "disconnected" | "heartbeat" {
  if (event === "disconnected" || event === "device_disconnected") {
    return "disconnected";
  }

  if (event === "heartbeat") {
    return "heartbeat";
  }

  return "detected";
}
