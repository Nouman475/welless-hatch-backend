import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import connectDB from "./database/db.js";

import authRoutes from "./routes/mics/authRoutes.js";
import adminProducts from "./routes/admin/productRoutes.js";
import uploadRoutes from "./routes/mics/uploadRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ORIGIN = process.env.SERVER_ORIGIN;
const NODE_ENV = process.env.NODE_ENV || "development";

// --- MIDDLEWARE ---

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Add CORS middleware specifically for uploads before serving static files
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later.",
});
app.use(limiter);

// Static files - Make sure uploads comes after CORS middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// --- ROUTES ---

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin/product", adminProducts);

// Mics
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// --- START SERVER ---
// --- CONNECT TO DATABASE ---

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${SERVER_ORIGIN}:${PORT} [${NODE_ENV}]`);
});

// --- ERROR HANDLING ---

["SIGTERM", "SIGINT"].forEach((signal) =>
  process.on(signal, () => {
    console.log(`📴 ${signal} received. Shutting down gracefully...`);
    process.exit(0);
  })
);

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
  process.exit(1);
});
