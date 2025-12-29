import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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

// 🔒 Hash secret before saving
deviceSchema.pre("save", async function(next) {
  if (!this.isModified("deviceSecret")) return next;
  const salt = await bcrypt.genSalt(10);
  this.deviceSecret = await bcrypt.hash(this.deviceSecret, salt);
  next;
});

export const Device = mongoose.model("Device", deviceSchema);