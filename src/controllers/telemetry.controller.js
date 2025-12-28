import { Telemetry } from "../models/telemetry.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    data // save all sensors as-is
  });

  // Optional: update device lastSeen (move to deviceVerify middleware if preferred)
  device.lastSeen = new Date();
  await device.save({ validateBeforeSave: false });

  // Respond
  return res.status(201).json(
    new ApiResponse(
      201,
      "Telemetry data saved successfully",
      { id: telemetry._id }
    )
  );
});

export {sendTelemetry}