import mongoose, { Schema } from "mongoose";

const telemetrySchema = new Schema(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    temperature: {
      type: Number,
      required: false,
    },
    humidity: {
      type: Number,
      required: false,
    },
    data: {
      type: Object, // Optional: for any other sensors
      default: {},
    },
  },
  { timestamps: true }
);

export const Telemetry = mongoose.model("Telemetry", telemetrySchema);
