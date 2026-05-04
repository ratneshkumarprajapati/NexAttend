import type { ConnectedDevice, RouterType } from "../adapters/router.adapter.js";

const MAC_PATTERN = /([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i;

export interface RawDeviceLike {
  mac?: unknown;
  macAddress?: unknown;
  ip?: unknown;
  ipAddress?: unknown;
  hostname?: unknown;
  hostName?: unknown;
  name?: unknown;
  rssi?: unknown;
  signal?: unknown;
  band?: unknown;
  interface?: unknown;
}

export function normalizeDevice(
  raw: RawDeviceLike,
  router: { key: string; name: string; type: RouterType }
): ConnectedDevice | null {
  const macValue = stringValue(raw.mac) ?? stringValue(raw.macAddress);
  if (!macValue || !MAC_PATTERN.test(macValue)) {
    return null;
  }

  return {
    mac: macValue.toLowerCase(),
    ip: stringValue(raw.ip) ?? stringValue(raw.ipAddress),
    hostname: stringValue(raw.hostname) ?? stringValue(raw.hostName) ?? stringValue(raw.name),
    connection: {
      rssi: numberValue(raw.rssi) ?? numberValue(raw.signal),
      band: stringValue(raw.band),
      interface: stringValue(raw.interface)
    },
    meta: {
      routerKey: router.key,
      routerName: router.name,
      routerType: router.type
    },
    source: "router",
    timeStamp: new Date()
  };
}

export function dedupeByMac(devices: ConnectedDevice[]): ConnectedDevice[] {
  const byMac = new Map<string, ConnectedDevice>();

  for (const device of devices) {
    const current = byMac.get(device.mac);
    if (!current || hasStrongerRssi(device, current)) {
      byMac.set(device.mac, device);
    }
  }

  return [...byMac.values()].sort((a, b) => a.mac.localeCompare(b.mac));
}

function hasStrongerRssi(candidate: ConnectedDevice, current: ConnectedDevice): boolean {
  const next = candidate.connection.rssi;
  const existing = current.connection.rssi;

  if (next === undefined) return false;
  if (existing === undefined) return true;
  return next > existing;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}
