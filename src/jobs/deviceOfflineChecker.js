import { Device } from "../models/device.model.js";

const OFFLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export const checkOfflineDevices = async () => {
  const cutoff = new Date(Date.now() - OFFLINE_THRESHOLD);

  const offlineDevices = await Device.find({
    lastSeen: { $lt: cutoff },
    isOnline: true
  });

  for (const device of offlineDevices) {
    device.isOnline = false;
    await device.save();
    
    console.log(`🚨 Device OFFLINE: ${device.deviceId}`);
    // 🔔 here: email / webhook / push / SMS
  }
};