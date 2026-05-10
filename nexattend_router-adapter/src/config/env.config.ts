import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;

  const configDir = path.dirname(fileURLToPath(import.meta.url));
  const appRoot = path.resolve(configDir, "../..");
  const candidates = new Set([
    path.join(appRoot, ".env"),
    path.join(process.cwd(), ".env"),
  ]);

  for (const envPath of candidates) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }

  loaded = true;
}
