import { Device } from "../models/device.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Telemetry } from "../models/telemetry.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendTelemetry = asyncHandler(async (req, res) => {
  const device = req.device
  if (JSON.stringify(req.body).length > 10_000) {
    throw new ApiError(413, "Telemetry payload too large");
  }
  const { temperature, humidity, data } = req.body;
  
  if (!temperature && !humidity && (!data || Object.keys(data).length === 0)) {
    throw new ApiError(400, "No telemetry data provided");
  }
  // get ready your telemetry data
  const telemetry = await Telemetry.create({
    device: device._id,
    temperature,
    humidity,
    data,
  });
  // Update device online status and lastSeen
  device.isOnline = true;
  device.lastSeen = new Date();
  //save telemetry data in db 
  await device.save({ validateBeforeSave: false })

  return res
    .status(201)
    .json(new ApiResponse(201, "Telemetry data saved successfully", telemetry));
});