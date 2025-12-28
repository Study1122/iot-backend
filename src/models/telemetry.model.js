import mongoose, { Schema } from "mongoose";

const telemetrySchema = new Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true
    },

    data: {
      temperature: {
        type: Number,
        min: -50,
        max: 150
      },
      humidity: {
        type: Number,
        min: 0,
        max: 100
      },
      voltage: {
        type: Number,
        min: 0
      }
    }
  },
  { timestamps: true }
);

// 🔥 TTL auto-delete after 30 days
telemetrySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

// 🔥 Fast dashboard queries
telemetrySchema.index({ device: 1, createdAt: -1 });


export const Telemetry = mongoose.model("Telemetry", telemetrySchema);
