import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.db.js";
import { app } from "./app.js";
import { Device } from "./models/device.model.js";
import { isDeviceOnline } from "./utils/deviceStatus.js";

// 🔥 OFFLINE CHECKER
setInterval(async () => {
  const devices = await Device.find(
    { status: "online" },
    { lastSeen: 1, status: 1, deviceId: 1 }
  );

  for (const device of devices) {
    if (!isDeviceOnline(device)) {
      device.status = "offline";
      await device.save({ validateBeforeSave: false });
      console.log(`🚨 Device OFFLINE: ${device.deviceId}`);
    }
  }
}, 30 * 1000);

// 🔌 START SERVER
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend Server running on port ${PORT}`);
    });
  })
  .catch(console.error);
  
  