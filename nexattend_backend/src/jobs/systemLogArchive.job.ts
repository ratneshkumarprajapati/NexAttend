import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import {
  createModuleLogger,
  formatSystemLogDate,
  rotateSystemLogFile,
} from "../utils/logger.js";

const logger = createModuleLogger("SystemLogArchiveJob");

const rawLogPattern = /^system-log-(\d{4}-\d{2}-\d{2})\.log$/;
const zipLogPattern = /^system-log-(\d{4}-\d{2}-\d{2})\.zip$/;

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

class SystemLogArchiveJob {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.timer || !env.SYSTEM_LOG.ENABLED) return;

    logger.info(
      `System log archive job enabled directory=${env.SYSTEM_LOG.DIRECTORY} retentionDays=${env.SYSTEM_LOG.RETENTION_DAYS}`,
    );
    void this.archiveOldLogs();
    this.scheduleNextRun();
  }

  stop() {
    if (!this.timer) return;

    clearTimeout(this.timer);
    this.timer = null;
  }

  private scheduleNextRun() {
    const now = new Date();
    const nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0);

    this.timer = setTimeout(() => {
      void this.runScheduled();
    }, nextRun.getTime() - now.getTime());
  }

  private async runScheduled() {
    try {
      rotateSystemLogFile();
      await this.archiveOldLogs();
    } finally {
      this.scheduleNextRun();
    }
  }

  private async archiveOldLogs() {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      await mkdir(env.SYSTEM_LOG.DIRECTORY, { recursive: true });
      const today = formatSystemLogDate();
      const entries = await readdir(env.SYSTEM_LOG.DIRECTORY);
      const oldRawLogs = entries
        .map((entry) => ({ entry, match: rawLogPattern.exec(entry) }))
        .filter((file): file is { entry: string; match: RegExpExecArray } => Boolean(file.match))
        .filter((file) => file.match[1] !== undefined && file.match[1] < today);

      for (const file of oldRawLogs) {
        await this.archiveRawLog(file.entry, file.match[1]!);
      }

      await this.pruneArchives();
    } catch (error) {
      logger.error("System log archive job failed", error);
    } finally {
      this.isRunning = false;
    }
  }

  private async archiveRawLog(fileName: string, dayName: string) {
    const rawPath = path.join(env.SYSTEM_LOG.DIRECTORY, fileName);
    const zipPath = path.join(env.SYSTEM_LOG.DIRECTORY, `system-log-${dayName}.zip`);
    const rawData = await readFile(rawPath);
    const zip = createZip([
      {
        name: fileName,
        data: rawData,
      },
    ]);

    await writeFile(zipPath, zip);
    await unlink(rawPath);

    logger.info(`System log archived: ${zipPath}`);
  }

  private async pruneArchives() {
    const entries = await readdir(env.SYSTEM_LOG.DIRECTORY);
    const archives = entries
      .map((entry) => ({ entry, match: zipLogPattern.exec(entry) }))
      .filter((file): file is { entry: string; match: RegExpExecArray } => Boolean(file.match))
      .sort((a, b) => b.match[1]!.localeCompare(a.match[1]!));

    const expiredArchives = archives.slice(env.SYSTEM_LOG.RETENTION_DAYS);

    await Promise.all(
      expiredArchives.map((archive) =>
        unlink(path.join(env.SYSTEM_LOG.DIRECTORY, archive.entry)),
      ),
    );

    if (expiredArchives.length > 0) {
      logger.info(`Pruned ${expiredArchives.length} expired system log archive(s)`);
    }
  }
}

export const systemLogArchiveJob = new SystemLogArchiveJob();
