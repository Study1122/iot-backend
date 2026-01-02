import mongoose, { Schema } from "mongoose";

const telemetrySchema = new Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: ["sensor", "control"],
      required: true
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
    },
    // 🔹 CONTROL EVENTS (updated)
    control: {
      featureId: { type: String },
      type: { type: String, enum:["fan", "bulb", "switch"] },
      name: { type: String },
      isOn: { type: Boolean },
      level: { type: Number }
    },

    source: {
      type: String,
      enum: ["device", "user"],
      default: "device"
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
telemetrySchema.index({ device: 1, eventType: 1, createdAt: -1 });


export const Telemetry = mongoose.model("Telemetry", telemetrySchema);
