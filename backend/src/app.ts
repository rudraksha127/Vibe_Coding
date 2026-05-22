import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { mongoSanitize } from "./middleware/mongoSanitize.js";
import morgan from "morgan";
import { corsOrigins, env } from "./config/env.js";
import { isDatabaseReady } from "./config/db.js";
import { setupSentryErrorHandler } from "./config/sentry.js";
import { authLimiter, globalLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { AppError } from "./utils/appError.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  app.get("/ready", (_req, res) => {
    const ready = isDatabaseReady();
    res.status(ready ? 200 : 503).json({
      success: ready,
      data: { database: ready ? "ready" : "unavailable" }
    });
  });

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new AppError(403, "FORBIDDEN", "CORS origin is not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use("/api", globalLimiter);
  app.use("/api/v1/auth", authLimiter);
  app.use("/api/v1", apiRouter);

  setupSentryErrorHandler(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

