import mongoose from "mongoose";
import { Device } from "../models/device.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerDevice = asyncHandler(async (req, res) => {
  const { deviceName, deviceId } = req.body;

  if (!deviceName || !deviceId) {
    throw new ApiError(400, "Device name and deviceId are required");
  }
  // prevent duplicate device
  const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      throw new ApiError(409, "Device already registered");
  }
  
  const device = new Device({
    deviceName,
    deviceId,
    owner: req.user._id,
  });
  
  const deviceSecret = device.generateDeviceSecret()
  device.deviceSecret = deviceSecret;
  await device.save();
  
  return res
  .status(201)
  .json(new ApiResponse(201,"Device registered successfully",{
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceSecret,
    })
  );
});


//Fetch all devices belonging to a user.
const getUserDevices = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const devices = await Device.find({ owner: userId });
  
  const now = Date.now();

  const result = devices.map(device => ({
    ...device.toObject(),
    isOnline:
      device.lastSeen && (now - device.lastSeen.getTime()) < 60 * 1000
  }));

  res.status(200).json(
    new ApiResponse(200, "Devices fetched successfully", devices)
  );
});

const getDeviceStatus = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  const device = await Device.findOne({ deviceId });
  if (!device) {
    throw new ApiError(404, "Device not found");
  }

  // 🔐 ownership check (VERY IMPORTANT)
  if (device.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized access to this device");
  }
  
  const now = new Date();
  const isOnline = device.lastSeen && (now - device.lastSeen) < 60 * 1000; // 1 min

  res.status(200).json(
    new ApiResponse(200, "Device status fetched", { online: isOnline })
  );
});

//heartbeat of IOT  endpoint
const heartbeat = asyncHandler(async (req, res) => {
  // device is already attached by verifyDevice middleware
  const device = req.device;

  device.lastSeen = new Date();
  await device.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, "Heartbeat received")
  );
});

export {registerDevice, getUserDevices, getDeviceStatus, heartbeat};