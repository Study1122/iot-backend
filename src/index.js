//require('dotenv').config({path: './env'});
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./db/index.db.js";
import { app } from "./app.js"; // import app from app.js
import { checkOfflineDevices } from "./jobs/deviceOfflineChecker.js";
import { Device } from "./models/device.model.js";

// 🔥 OFFLINE CHECKER (START AFTER DB CONNECT)
setInterval(async () => {
  const now = new Date();
  const devices = await Device.find();

  for (const device of devices) {
    const isOnline =
      device.lastSeen && now - device.lastSeen < 60 * 1000;

    if (!isOnline && device.isOnline) {
      device.isOnline = false;
      await device.save({ validateBeforeSave: false });
      console.log(`🚨 Device OFFLINE: ${device.deviceId}`);
    }
  }
}, 30 * 1000);


connectDB().then(()=>{
  const PORT = process.env.PORT || 8000
  app.listen(PORT, "0.0.0.0", ()=>{
    console.log(`Backend Server is running at port ${process.env.PORT}`)
  })
}).catch((err) => {
    console.log("ERROR: MongoDB connection failed!!!", err);
});
