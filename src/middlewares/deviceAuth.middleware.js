import { Device } from "../models/device.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyDevice = async (req, res, next) => {
  try {
    const deviceId = req.headers["x-device-id"];
    const deviceSecret = req.headers["x-device-secret"];

    if (!deviceId || !deviceSecret) {
      throw new ApiError(401, "Device ID and Secret are required");
    }

    // Find device in DB
    const device = await Device.findOne({ deviceId })
      .select("+deviceSecret");

    if (!device) {
      throw new ApiError(401, "Device not found");
    }

    // Compare secret
    if (device.deviceSecret !== deviceSecret) {
      throw new ApiError(401, "Invalid device credentials");
    }

    // Attach device to request for controllers
    req.device = device;
    next();
  } catch (err) {
    next(err);
  }
};