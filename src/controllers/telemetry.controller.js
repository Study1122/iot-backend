import { Telemetry } from "../models/telemetry.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Device } from "../models/device.model.js";
import mongoose from "mongoose";
/**
 * Controller: Save telemetry data from a device
 * Expects req.device from deviceVerify middleware
 * Expects req.body.data = { temperature, humidity, voltage, ... }
 */
const sendTelemetry = asyncHandler(async (req, res) => {
  const device = req.device;

  // Optional: payload size limit (better enforced globally with express.json({limit}))
  if (JSON.stringify(req.body).length > 10_000) {
    throw new ApiError(413, "Telemetry payload too large");
  }

  const { data } = req.body;

  // Validate non-empty data
  if (!data || Object.keys(data).length === 0) {
    throw new ApiError(400, "No telemetry data provided");
  }

  // Save telemetry
  const telemetry = await Telemetry.create({
    device: device._id,
    eventType: "sensor",
    data, // save all sensors as-is
    source: "device"
  });

  // Optional: update device lastSeen (move to deviceVerify middleware if preferred)
  device.lastSeen = new Date();
  await device.save({ validateBeforeSave: false });

  // Respond
  res
  .status(201)
  .json(new ApiResponse(201,"Telemetry data saved successfully",
      { id: telemetry._id }
    )
  );
});

const getDeviceTelemetry = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  //console.log(deviceId)
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  // deviceId is STRING, not ObjectId
  const device = await Device.findOne({ deviceId });

  if (!device) {
    throw new ApiError(404, "Device not found");
  }

  // ownership check
  if (device.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const telemetry = await Telemetry.find({ device: device._id })
  .sort({ createdAt: -1 }).limit(limit);

  res.status(200).json(
    new ApiResponse(200, "Telemetry fetched successfully", (telemetry) )
  );
});
export {sendTelemetry, getDeviceTelemetry}