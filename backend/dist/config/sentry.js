import * as Sentry from "@sentry/node";
import { env } from "./env.js";
export function initSentry() {
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
export function setupSentryErrorHandler(app) {
    if (env.SENTRY_DSN) {
        Sentry.setupExpressErrorHandler(app);
    }
}
export function captureException(error) {
    if (env.SENTRY_DSN) {
        Sentry.captureException(error);
    }
}
