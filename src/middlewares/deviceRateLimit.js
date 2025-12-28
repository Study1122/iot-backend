// src/middlewares/deviceRateLimit.js
import rateLimit from "express-rate-limit";

export const deviceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per device
  message: "Too many telemetry requests"
});