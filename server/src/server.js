import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import alertRoutes from "./routes/alertRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { registerAlertSocket } from "./socket/alertSocket.js";

const port = process.env.PORT || 5000;

console.log("CLIENT_URL =", process.env.CLIENT_URL);

const app = express();
const server = createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set("io", io);
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

registerAlertSocket(io);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "emergency-sos-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);

app.use(notFound);
app.use(errorHandler);

connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(
        `Emergency SOS API listening on port ${port}`
      );
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });