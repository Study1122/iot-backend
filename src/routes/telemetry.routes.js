import { Router } from "express";
import { verifyDevice } from "../middlewares/deviceAuth.middleware.js";
import { sendTelemetry } from "../controllers/telemetry.controller.js";
import { deviceRateLimit } from "../middlewares/deviceRateLimit.js"
import { validateTelemetry } from "../middlewares/validateTelemetry.middleware.js";

const router = Router();

// Only authenticated devices can send telemetry
router.post("/telemetry/send", verifyDevice, validateTelemetry, deviceRateLimit, sendTelemetry);

export default router;