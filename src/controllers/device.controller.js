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

export {registerDevice};