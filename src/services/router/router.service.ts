import { log } from "node:console";
import { env } from "../../config/env.js";
import { routerClient } from "../http/routerClient.instance.js";
import type { ConnectedDevice, RouterJwtPayload, RouterLoginResponse } from "./router.types.js";
import logger from "../../utils/logger.js";



class RouterService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  private getCommandUrl(command: string) {
    return `/dm/sys/?cmd=${encodeURIComponent(command)}`;
  }

  private getTokenExpiry(token: string) {
    try {
      const payloadPart = token.split(".")[1];

      if (!payloadPart) {
        return Date.now() + 25 * 60 * 1000;
      }

      const payload = JSON.parse(
        Buffer.from(payloadPart, "base64url").toString("utf8")
      ) as RouterJwtPayload;

      if (payload.iat && payload.SessionTimeout) {
        return (payload.iat + payload.SessionTimeout - 30) * 1000;
      }
    } catch {
      // Fall back to a conservative timeout if the router changes token format.
    }

    return Date.now() + 25 * 60 * 1000;
  }

  private async login() {
    const res = await routerClient.post<RouterLoginResponse>(
      this.getCommandUrl("Login"),
      {
        Login: {
          data: {
            username: env.ROUTER.USERNAME,
            password: env.ROUTER.PASSWORD,
            captcha: "",
          },
        },
      }
    );

    const login = res.Login?.data?.login;
    const token = login?.authenticatedToken;
    if (res.Login?.status_code !== 200 || login?.status !== "success" || !token) {
      throw new Error("Router login failed");
    }

    this.token = token;
    this.tokenExpiry = this.getTokenExpiry(token);
  }

  private async ensureAuth() {
    if (!this.token || !this.tokenExpiry || Date.now() > this.tokenExpiry) {
      await this.login();
    }
  }

  private async request<T>(command: string) {
    await this.ensureAuth();

    try {
      const response = await routerClient.get<T>(command, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response
    } catch (error: any) {
      if (error.message.includes("401")) {
        await this.login();

        return routerClient.get<T>(this.getCommandUrl(command), {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      }

      logger.error(error)
      throw error;
    }
  }

  async fetchConnectedDevices() {
    const data = await this.request<any>("/dm/tr98/?objs=WLANAssociatedDevice&page=StatusPage-CurrentWirelessUser");

    const rawDevices = data?.WLANAssociatedDevice?.data || [];
    // console.table(rawDevices)
    return rawDevices.map((d: any):ConnectedDevice => ({
      mac: d.associatedDeviceMACAddress?.toLowerCase(), // normalize
      ip: d.associatedDeviceIPAddress,

      hostname: d.associatedDeviceHostName || null,
      manufacturer: d.associatedDeviceManufacturer || null,

      connection: {
        band: d.associatedDeviceStandard, // 2.4G / 5G
        rssi: d.associatedDeviceRSSI,     // signal strength
        txRate: d.associatedDeviceTxRate,
        rxRate: d.associatedDeviceRecvRate,
      },

      session: {
        duration: d.associatedDeviceDuration, // seconds connected
        expireTime: d.associatedDeviceExpireTime,
      },

      meta: {
        ssidIndex: d.associatedDeviceSSIDIndex,
        iid: d.iid,
      },

      source: "router",
    }));
  }
}

export const routerService = new RouterService();
