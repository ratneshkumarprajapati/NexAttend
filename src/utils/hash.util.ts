import crypto from "crypto";
import { env } from "../config/env.js";

export function hashMac(mac: string) {
  return crypto
    .createHash("sha256")
    .update(mac.toLowerCase())
    .digest("hex");
}