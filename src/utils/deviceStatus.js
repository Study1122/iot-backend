
export const isDeviceOnline = (device, thresholdMs = 60_000) => {
  if (!device.lastSeen) return false;
  return Date.now() - new Date(device.lastSeen).getTime() < thresholdMs;
};