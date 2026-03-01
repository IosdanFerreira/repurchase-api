import "reflect-metadata";
import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";

import { RateLimiterMemory } from "rate-limiter-flexible";
import RestAppError from "@shared/errors/RestAppError";
import { Server as SocketIOServer } from "socket.io";
import communicationRouter from "@modules/communication/infra/http/routes/communication.routes";
import cors from "cors";
import { createServer } from "http";
import helmet from "helmet";
import { join } from "path";

const app = express();
const httpServer = createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join entity-specific room for notifications
  socket.on("join:entity", (entity_id: string) => {
    socket.join(`entity:${entity_id}`);
    console.log(`Socket ${socket.id} joined room entity:${entity_id}`);
  });

  // Leave entity room
  socket.on("leave:entity", (entity_id: string) => {
    socket.leave(`entity:${entity_id}`);
    console.log(`Socket ${socket.id} left room entity:${entity_id}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

// Helmet for security (production)
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files as static
app.use("/uploads", express.static(join(process.cwd(), "uploads")));

// Rate limiter for REST endpoints
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    await rateLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({ error: "Too many requests" });
  }
});

// REST Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "REPURCHASE API is running!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// REST Hello World endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Hello, World! Welcome to REPURCHASE API",
    version: "1.0.0",
    description:
      "Aplicação que estrutura o remarketing, com integração com o whatsapp(whatsmeow), integração com o wordpress(woocommerce)",
    graphql: "/graphql",
  });
});

// Communication routes (WhatsApp webhooks)
app.use("/api/communication", communicationRouter);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof RestAppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export { app, httpServer, io };
