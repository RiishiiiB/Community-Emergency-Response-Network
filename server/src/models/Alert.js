import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved", "note"],
      required: true
    },

    action: {
      type: String,
      enum: ["creator", "acknowledger", "resolver", "note"],
      default: "note"
    },

    message: {
      type: String,
      required: true
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    at: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const alertSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true,
      maxlength: 100
    },

    type: {
      type: String,
      enum: [
        "medical",
        "fire",
        "crime",
        "accident",
        "disaster",
        "other"
      ],
      default: "other"
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high"
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active"
    },

    location: {
      address: {
        type: String,
        trim: true
      },

      lat: Number,
      lng: Number,
      accuracy: Number,
      mapsUrl: String
    },

    contact: {
      name: String,
      phone: String
    },

    assignedResponder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // NEW FIELDS
    resolvedByRole: {
      type: String,
      enum: ["citizen", "responder", "admin"],
      default: null
    },

    resolvedByUser: {
      type: String,
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    timeline: [timelineSchema]
  },
  {
    timestamps: true
  }
);

alertSchema.index({
  status: 1,
  createdAt: -1
});

alertSchema.index({
  citizen: 1,
  createdAt: -1
});

alertSchema.index({
  assignedResponder: 1,
  createdAt: -1
});

export const Alert = mongoose.model("Alert", alertSchema);