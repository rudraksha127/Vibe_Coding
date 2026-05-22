import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { corsOrigins } from "../config/env.js";
import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function initSockets(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = readSocketToken(socket.handshake.auth.token, socket.handshake.headers.authorization);
      const payload = verifyAccessToken(token);
      socket.data.user = {
        id: payload.sub,
        role: payload.role,
        sessionId: payload.sessionId
      };
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as { id: string };
    socket.join(`user:${user.id}`);
    logger.debug("Socket connected", { socketId: socket.id, userId: user.id });
  });

  return io;
}

function readSocketToken(authToken: unknown, authorizationHeader: string | undefined): string {
  if (typeof authToken === "string") {
    return authToken;
  }

  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice("Bearer ".length);
  }

  throw new Error("Missing socket token");
}

