import { Router } from "express";
import { registerDevice, getUserDevices, getDeviceStatus, heartbeat} from "../controllers/device.controller.js";
import { getDeviceTelemetry } from "../controllers/telemetry.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { verifyDevice } from "../middlewares/deviceAuth.middleware.js";
import { deviceRateLimit } from "../middlewares/deviceRateLimit.js";


const router = Router();
router.get("/test", (req, res) => res.send("Router works!"));


// 🔐 user must be logged in
router.post("/devices/register", authMiddleware, registerDevice);
//Fetch all devices belonging to a user.
router.get("/devices/user/:userId/devices", authMiddleware, getUserDevices);
//get status of all devices
router.get("/devices/:deviceId/status", authMiddleware, getDeviceStatus);
//Telemetry history
router.get("/devices/:deviceId/telemetry", authMiddleware, getDeviceTelemetry);
//heartbeat of iot
router.post("/devices/heartbeat", verifyDevice, deviceRateLimit, heartbeat);
export default router;