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
    status: { 
      type: String, 
      default: "offline" 
    },
    lastSeen: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 🔥 Scalable controls
    features: [
      {
        _id: false,
        
        featureId: { 
          type: String, 
          required: true 
          
        }, // fan1, bulb2
        
        type: {
          type: String,
          enum: ["fan", "bulb", "switch"],
          required: true
        },
        
        name: String, // Bedroom Fan
        
        isOn: { type: Boolean, default: false },

        // 🔥 regulator (fan speed)
        level: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        }
      }
    ]
  },
  { timestamps: true }
);

// 🔑 generate secret
deviceSchema.methods.generateDeviceSecret = function () {
  return crypto.randomBytes(32).toString("hex");
};

// 🔒 Hash secret before saving
deviceSchema.pre("save", async function() {
  if (!this.isModified("deviceSecret")) return;
  const salt = await bcrypt.genSalt(10);
  this.deviceSecret = await bcrypt.hash(this.deviceSecret, salt);
});

export const Device = mongoose.model("Device", deviceSchema);