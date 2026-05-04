import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import prisma from "../services/prisma/prisma.client.js";
import logger from "../utils/logger.js";

type XlsCellValue = string | number | Date | null | undefined;
type XlsRow = Record<string, XlsCellValue>;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const pad2 = (value: number) => value.toString().padStart(2, "0");

const formatDateName = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getPreviousLocalDayRange = (reference = new Date()) => {
  const end = startOfLocalDay(reference);
  const start = new Date(end.getTime() - MS_PER_DAY);

  return {
    start,
    end,
    name: formatDateName(start),
  };
};

const escapeHtml = (value: XlsCellValue) => {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const buildXls = (sheetName: string, columns: string[], rows: XlsRow[]) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 4px; }
    th { font-weight: bold; background: #e8eef7; }
  </style>
</head>
<body>
  <table>
    <caption>${escapeHtml(sheetName)}</caption>
    <thead>
      <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`,
        )
        .join("\n")}
    </tbody>
  </table>
</body>
</html>
`;

const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < table.length; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const crc32 = (buffer: Buffer) => {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const dosDateTime = (date = new Date()) => {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
};

const createZip = (files: Array<{ name: string; data: Buffer }>) => {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const { dosDate, dosTime } = dosDateTime();
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name);
    const checksum = crc32(file.data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(file.data.length, 18);
    localHeader.writeUInt32LE(file.data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, file.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(file.data.length, 20);
    centralHeader.writeUInt32LE(file.data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + file.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
};

class LogDumpJob {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.timer || !env.LOG_DUMP.ENABLED) return;

    logger.info(
      `Log dump job scheduled daily at ${pad2(env.LOG_DUMP.HOUR)}:${pad2(env.LOG_DUMP.MINUTE)}`,
    );
    this.scheduleNextRun();
  }

  stop() {
    if (!this.timer) return;

    clearTimeout(this.timer);
    this.timer = null;
  }

  async runForPreviousDay(reference = new Date()) {
    const range = getPreviousLocalDayRange(reference);
    return this.createDump(range.start, range.end, range.name);
  }

  private scheduleNextRun() {
    const now = new Date();
    const nextRun = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      env.LOG_DUMP.HOUR,
      env.LOG_DUMP.MINUTE,
      0,
      0,
    );

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    this.timer = setTimeout(() => {
      void this.runScheduled();
    }, nextRun.getTime() - now.getTime());
  }

  private async runScheduled() {
    try {
      await this.runForPreviousDay();
    } finally {
      this.scheduleNextRun();
    }
  }

  private async createDump(start: Date, end: Date, dayName: string) {
    if (this.isRunning) {
      logger.warn("Log dump skipped because a previous dump is still running");
      return null;
    }

    this.isRunning = true;

    try {
      await mkdir(env.LOG_DUMP.DIRECTORY, { recursive: true });

      const [attendanceRows, presenceRows] = await Promise.all([
        this.loadAttendanceRows(start, end),
        this.loadPresenceRows(start, end),
      ]);

      const attendanceColumns = [
        "id",
        "publicId",
        "sessionId",
        "userId",
        "userEmail",
        "deviceId",
        "deviceName",
        "timestamp",
        "status",
        "createdAt",
      ];
      const presenceColumns = [
        "id",
        "publicId",
        "deviceId",
        "deviceName",
        "userId",
        "userEmail",
        "apId",
        "accessPointName",
        "sessionId",
        "rssi",
        "seenAt",
        "createdAt",
      ];

      const zip = createZip([
        {
          name: `attendance-log-${dayName}.xls`,
          data: Buffer.from(buildXls("AttendanceLog", attendanceColumns, attendanceRows), "utf8"),
        },
        {
          name: `presence-log-${dayName}.xls`,
          data: Buffer.from(buildXls("PresenceLog", presenceColumns, presenceRows), "utf8"),
        },
      ]);
      const zipPath = path.join(env.LOG_DUMP.DIRECTORY, `${dayName}.zip`);

      await writeFile(zipPath, zip);

      logger.info(
        `Log dump created: ${zipPath} attendanceRows=${attendanceRows.length} presenceRows=${presenceRows.length}`,
      );

      return zipPath;
    } catch (error) {
      logger.error("Log dump failed", error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async loadAttendanceRows(start: Date, end: Date) {
    const rows: XlsRow[] = [];
    let cursorId = 0;

    while (true) {
      const batch = await prisma.attendanceLog.findMany({
        where: {
          id: {
            gt: cursorId,
          },
          timestamp: {
            gte: start,
            lt: end,
          },
        },
        orderBy: {
          id: "asc",
        },
        take: env.LOG_DUMP.BATCH_SIZE,
        include: {
          user: true,
          device: true,
        },
      });

      for (const row of batch) {
        rows.push({
          id: row.id,
          publicId: row.publicId,
          sessionId: row.sessionId,
          userId: row.userId,
          userEmail: row.user.email,
          deviceId: row.deviceId,
          deviceName: row.device.deviceName,
          timestamp: row.timestamp,
          status: row.status,
          createdAt: row.createdAt,
        });
      }

      if (batch.length < env.LOG_DUMP.BATCH_SIZE) break;
      cursorId = batch[batch.length - 1]!.id;
    }

    return rows;
  }

  private async loadPresenceRows(start: Date, end: Date) {
    const rows: XlsRow[] = [];
    let cursorId = 0;

    while (true) {
      const batch = await prisma.presenceLog.findMany({
        where: {
          id: {
            gt: cursorId,
          },
          seenAt: {
            gte: start,
            lt: end,
          },
        },
        orderBy: {
          id: "asc",
        },
        take: env.LOG_DUMP.BATCH_SIZE,
        include: {
          device: {
            include: {
              user: true,
            },
          },
          accessPoint: true,
        },
      });

      for (const row of batch) {
        rows.push({
          id: row.id,
          publicId: row.publicId,
          deviceId: row.deviceId,
          deviceName: row.device.deviceName,
          userId: row.device.userId,
          userEmail: row.device.user.email,
          apId: row.apId,
          accessPointName: row.accessPoint?.name,
          sessionId: row.sessionId,
          rssi: row.rssi,
          seenAt: row.seenAt,
          createdAt: row.createdAt,
        });
      }

      if (batch.length < env.LOG_DUMP.BATCH_SIZE) break;
      cursorId = batch[batch.length - 1]!.id;
    }

    return rows;
  }
}

export const logDumpJob = new LogDumpJob();
