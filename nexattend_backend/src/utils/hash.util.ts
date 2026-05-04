import crypto from "crypto";

export function hashMac(mac: string) {
  return crypto
    .createHash("sha256")
    .update(mac.toLowerCase())
    .digest("hex");
}