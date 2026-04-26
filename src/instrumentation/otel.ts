import { diag, DiagConsoleLogger, DiagLogLevel, SpanStatusCode, trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

let sdk: NodeSDK | null = null;
let telemetryStarted = false;

const buildMetricReaders = () => {
  if (!env.OTEL.METRICS_ENABLED) {
    return [];
  }

  const exporter =
    env.OTEL.EXPORTER === "otlp"
      ? new OTLPMetricExporter({
          url: env.OTEL.OTLP_METRICS_ENDPOINT,
        })
      : new ConsoleMetricExporter();

  return [
    new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: env.OTEL.METRIC_EXPORT_INTERVAL_MS,
    }),
  ];
};

const buildSpanProcessor = () => {
  const exporter =
    env.OTEL.EXPORTER === "otlp"
      ? new OTLPTraceExporter({
          url: env.OTEL.OTLP_TRACES_ENDPOINT,
        })
      : new ConsoleSpanExporter();

  if (env.OTEL.EXPORTER === "otlp") {
    return new BatchSpanProcessor(exporter);
  }

  return new SimpleSpanProcessor(exporter);
};

export const startTelemetry = async () => {
  if (!env.OTEL.ENABLED || telemetryStarted) {
    return;
  }

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: env.APP_NAME,
      [ATTR_SERVICE_VERSION]: "1.0.0",
    }),
    spanProcessors: [buildSpanProcessor()],
    metricReaders: buildMetricReaders(),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
      new PrismaInstrumentation(),
    ],
  });

  sdk.start();
  telemetryStarted = true;

  logger.info(
    `OpenTelemetry started with ${env.OTEL.EXPORTER} exporter${
      env.OTEL.METRICS_ENABLED ? " and metrics enabled" : ""
    }`,
  );
};

export const stopTelemetry = async () => {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = null;
  telemetryStarted = false;
  logger.info("OpenTelemetry shut down successfully.");
};

export const registerTelemetryShutdownHandlers = () => {
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, async () => {
      try {
        await stopTelemetry();
      } catch (error) {
        logger.error("Failed to shut down OpenTelemetry", error);
      }
    });
  }
};

export const telemetryTracer = trace.getTracer("nexattend-service");

export const withActiveSpan = async <T>(
  name: string,
  attributes: Record<string, string | number | boolean | undefined>,
  fn: () => Promise<T>,
): Promise<T> =>
  telemetryTracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      } else {
        span.setStatus({ code: SpanStatusCode.ERROR, message: "Unknown error" });
      }
      throw error;
    } finally {
      span.end();
    }
  });
