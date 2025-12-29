
//check for 2 min default
export const isDeviceOnline = (device, thresholdMs = 2 * 60 * 1000) => {
  if (!device.lastSeen) return false;
  return Date.now() - device.lastSeen.getTime() < thresholdMs;
};