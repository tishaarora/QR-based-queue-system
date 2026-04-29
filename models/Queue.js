import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema(
  {
    businessProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
    },

    queueName: {
      type: String,
      required: true,
    },

    queueSlug: {
      type: String,
      required: true,
      unique: true,
    },

    qrCodeUrl: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Queue ||
  mongoose.model("Queue", QueueSchema);