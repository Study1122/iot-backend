import mongoose {Schema} from "mongoose";

const deviceSchema = new Schema(
  {
    deviceName:{
      type: String,
      required: true,
      lowercase:true,
      unique:true,
      trim:true,
    },
    deviceId:{
      type: String,
      required: true,
      lowercase:true,
      unique:true,
      trim:true,
    },
    owner:{
      type: mongoose.Schema.Types.onjectId,
      ref:"User",
      required: true
    },
    isOnline{
      type: Boolean,
      default: false
    }
  },
  {timestamps: true}
);

export const Device = mongoose.model("Device", deviceSchema);
