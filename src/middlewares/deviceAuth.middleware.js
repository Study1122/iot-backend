import { Device } from "../models/device.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs";

const verifyDevice = async (req, res, next) => {
  try {
    const deviceId = req.headers["x-device-id"];
    const incomingDeviceSecret = req.headers["x-device-secret"];

    if (!deviceId || !incomingDeviceSecret) {
      throw new ApiError(401, "Device ID and Secret are required");
    }

    // Find device in DB
    const device = await Device.findOne({ deviceId })
      .select("+deviceSecret");

    if (!device) {
      throw new ApiError(401, "Invalid device credentials!!");
    }
    //compare secret tokens
    const isValid = await bcrypt.compare(
      incomingDeviceSecret,
      device.deviceSecret
    );
    
    if (!isValid) {
      throw new ApiError(401, "Invalid device credentials");
    }

    // Attach device to request for controllers
    req.device = device;
    next();
  } catch (err) {
    next(err);
  }
};

export { verifyDevice }