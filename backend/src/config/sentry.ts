import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { logger } from "../lib/logger";

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.warn("⚠️ Sentry DSN not found. Skipping Sentry initialization.");
    return;
  }

  Sentry.init({
    dsn: dsn,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    profilesSampleRate: 1.0,
  });

  logger.info("✅ Sentry initialized successfully.");
};
