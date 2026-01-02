import mongoose from "mongoose";
import { Device } from "../models/device.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Telemetry } from "../models/telemetry.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isDeviceOnline } from "../utils/deviceStatus.js";

const registerDevice = asyncHandler(async (req, res) => {
  const { deviceName, deviceId, features } = req.body;

  if (!deviceName || !deviceId) {
    throw new ApiError(400, "Device name and deviceId are required");
  }
  // prevent duplicate device
  const existingDevice = await Device.findOne({ deviceId }).select("-deviceSecret -plainSecret")
    if (existingDevice) {
      throw new ApiError(409, "Device already registered");
  }
  // Create device instance
  const device = new Device({
    deviceName,
    deviceId,
    owner: req.user._id,
    features: features || [] // optional default features
  })
  
  // Generate plain secre
  const plainSecret = device.generateDeviceSecret()
  device.plainSecret = plainSecret;
  device.deviceSecret = plainSecret
  // Save to DB
  await device.save();
  
  return res
  .status(201)
  .json(new ApiResponse(201,"Device registered successfully",{
      id: device._id,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceSecret: device.deviceSecret,
      plainSecret: device.plainSecret,//<--this is what device will use for auth
    })
  );
});
//get device by (_id).<<= use for db query like delete regenerateDeviceSecret
const getDeviceById = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(deviceId)) {
    throw new ApiError(400, "Invalid device id");
  }

  const device = await Device.findOne({
    _id: deviceId,
    owner: userId,
  });

  if (!device) {
    throw new ApiError(404, "Device not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Device fetched successfully", device)
  );
}); 
//Fetch all devices belonging to a user by (userId).
const getUserDevices = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const devices = await Device
  .find({ owner: userId })

  const now = Date.now();

  const result = devices.map(device => ({
    ...device.toObject(),
    status: isDeviceOnline(device) ? "online" : "offline"
  }));

  res.status(200).json(
    new ApiResponse(200, "Devices fetched successfully", result)
  );
});
// devices status
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
  
  const online = isDeviceOnline(device);
  const newStatus = online ? "online" : "offline";
  // optional: keep DB in sync
  if (device.status !== newStatus) {
    device.status = newStatus;
    await device.save();
  }
  
  res.status(200).json(
    new ApiResponse(200, "Device status fetched", { 
      status: device.status,
      lastSeen: device.lastSeen
    })
  );
});
//regenerate Device Secret
const regenerateDeviceSecret = asyncHandler(async (req, res) =>{
  const { deviceId } = req.params;
  const userId = req.user._id;
  
  const device = await Device.findOne({
    _id: deviceId,
    owner: userId,
  }).select("+deviceSecret +plainSecret");

  if (!device) {
    throw new ApiError(404, "Regenarate-Device not found!!!");
  }

  // 🔑 generate new secret
  const plainSecret = device.generateDeviceSecret()

  device.deviceSecret = plainSecret;
  device.plainSecret = plainSecret; // ⚠️ show only once
  await device.save();
  
  res
  .status(200)
  .json(new ApiResponse(200,"Device secret regenerated",
    {plainSecret: plainSecret}
  ));
  
});
// ➕ ADD NEW FEATURE (bulb / fan / switch)
const addDeviceFeature = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { featureId, type, name } = req.body;

  if (!featureId || !type) {
    throw new ApiError(400, "featureId and type are required");
  }

  const device = await Device.findOne({ deviceId });
  if (!device) throw new ApiError(404, "Device not found");

  // 🔐 ownership check
  if (device.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  // ❌ prevent duplicate feature
  const exists = device.features.some(
    f => f.featureId === featureId
  );
  if (exists) {
    throw new ApiError(409, "Feature already exists");
  }

  const newFeature = {
    featureId,
    type,
    name: name || featureId,
    isOn: false,
    level: type === "fan" ? 0 : 0
  };

  device.features.push(newFeature);
  await device.save();

  res.status(201).json(
    new ApiResponse(201, "Feature added", newFeature)
  );
});
//update new feature for bulb and fan endpoint
const updateDeviceFeature = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { featureId, type, isOn, level, name } = req.body;
  
  const device = await Device.findOne({ deviceId });
  
  if (!device) throw new ApiError(404, "Device not found");

  if (device.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Unauthorized");

  const feature = device.features.find(f => f.featureId === featureId);
  if (!feature) throw new ApiError(404, "Feature not found");

  if (typeof isOn === "boolean") feature.isOn = isOn;
  if (typeof level === "number") feature.level = level;
  if (name) feature.name = name;
  if (type) feature.type = type;
  
  await device.save();

  // 🔥 LOG CONTROL EVENT
  await Telemetry.create({
    device: device._id,
    eventType: "control",
    control: {
      featureId: feature.featureId,
      type: feature.type,
      name: feature.name,
      isOn: feature.isOn,
      level: feature.level
    },
    source: "user"
  });

  res
  .status(200)
  .json(new ApiResponse(200 ,"Feature updated", feature));
});
// ❌ REMOVE FEATURE
const removeDeviceFeature = asyncHandler(async (req, res) => {
  const { deviceId, featureId } = req.params;

  const device = await Device.findOne({ deviceId });
  if (!device) throw new ApiError(404, "Device not found");

  if (device.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const before = device.features.length;

  device.features = device.features.filter(
    f => f.featureId !== featureId
  );

  if (before === device.features.length) {
    throw new ApiError(404, "Feature not found");
  }

  await device.save();

  res
  .status(200)
  .json(new ApiResponse(200, "Feature removed", {featureId})
  );
});

const deleteDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user._id;
  
  if (!mongoose.Types.ObjectId.isValid(deviceId)) {
    throw new ApiError(400, "Invalid device id");
  }

  // ✅ Only delete device if it belongs to the logged-in user
  const device = await Device.findOneAndDelete({
    _id: deviceId,
    owner: userId,
  });

  if (!device) {
    throw new ApiError(404, "Device not found or already deleted");
  }

  res.status(200).json(
    new ApiResponse(200, "Device deleted successfully")
  );
});
//heartbeat of IOT  endpoint
 const heartbeat = asyncHandler(async (req, res) => {
  // device is already attached by verifyDevice middleware
  const device = req.device;

  device.lastSeen = new Date();
  device.status = "online";
  await device.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, "Heartbeat received")
  );
});

export {registerDevice, getUserDevices, getDeviceStatus, heartbeat, getDeviceById, deleteDevice, regenerateDeviceSecret, addDeviceFeature, updateDeviceFeature, removeDeviceFeature};

