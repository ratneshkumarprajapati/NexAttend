import { startTelemetry } from "./instrumentation/otel.js";

await startTelemetry();
await import("./server.js");
