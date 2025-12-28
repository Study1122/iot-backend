import { Router } from "express";
import { verifyDevice } from "../middlewares/deviceAuth.middleware.js";
import { sendTelemetry } from "../controllers/telemetry.controller.js";
import {deviceRateLimit} from "../middlewares/deviceRateLimit.js"

const router = Router();

// Only authenticated devices can send telemetry
router.post("/send", verifyDevice, deviceRateLimit, sendTelemetry);

export default router;