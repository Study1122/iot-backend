import mongoose from "mongoose";
import crypto from "crypto";

const deviceSchema = new mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    deviceSecret: {
      type: String,
      required: true,
      select: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastSeen: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔑 generate secret
deviceSchema.methods.generateDeviceSecret = function () {
  return crypto.randomBytes(32).toString("hex");
};

export const Device = mongoose.model("Device", deviceSchema);