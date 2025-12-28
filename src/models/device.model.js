import mongoose, {Schema} from "mongoose";
import crypto from "crypto";

const deviceSchema = new Schema(
  {
    deviceName:{
      type: String,
      required: true,
      lowercase:true,
      trim:true,
    },
    deviceId:{
      type: String,
      required: true,
      lowercase:true,
      unique:true,
      trim:true,
    },
    
    deviceSecret: {
      type: String,
      select: false, // 🔐 never return by default
    },
    
    owner:{
      type: Schema.Types.ObjectId,
      ref:"User",
      required: true
    },
    isOnline:{
      type: Boolean,
      default: false
    },
    lastSeen: Date,
  },
  {timestamps: true}
);

deviceSchema.methods.generateDeviceSecret = function () {
  return crypto.randomBytes(32).toString("hex");
};


export const Device = mongoose.model("Device", deviceSchema);
