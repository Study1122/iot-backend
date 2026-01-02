import { Router } from "express";
import { registerDevice, getUserDevices, getDeviceStatus, getDeviceById, heartbeat, regenerateDeviceSecret, deleteDevice, addDeviceFeature, updateDeviceFeature, removeDeviceFeature} from "../controllers/device.controller.js";
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
// regenerate secrets
router.patch("/devices/:deviceId/regenerate-secret", authMiddleware, regenerateDeviceSecret);
//❌ delete device 
router.delete("/devices/:deviceId",authMiddleware, deleteDevice);
//add features
router.post("/devices/:deviceId/feature", authMiddleware,
  addDeviceFeature
);
//update device feature
router.patch("/devices/:deviceId/feature", authMiddleware, updateDeviceFeature);
//❌ remove device feature
router.delete("/devices/:deviceId/feature/:featureId", authMiddleware, removeDeviceFeature);
//Telemetry history
router.get("/devices/:deviceId/telemetry", authMiddleware, getDeviceTelemetry);
//get Device by Id
router.get("/devices/:deviceId", authMiddleware, getDeviceById);
//heartbeat of iot
router.post("/devices/heartbeat", verifyDevice, deviceRateLimit, heartbeat);
export default router;