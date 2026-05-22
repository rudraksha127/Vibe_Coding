import type { Express } from "express";
import * as Sentry from "@sentry/node";
import { env } from "./env.js";

export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    }
  });
}

export function setupSentryErrorHandler(app: Express): void {
  if (env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
}

export function captureException(error: unknown): void {
  if (env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
}

