const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const contentRoutes = require("./routes/content.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);
app.use(errorHandler);

async function start() {
  if (!env.mongodbUri) throw new Error("MONGODB_URI is required");
  await mongoose.connect(env.mongodbUri);
  app.listen(env.port);
}

start().catch((err) => {
  console.error("Server start failed", err);
  process.exit(1);
});
