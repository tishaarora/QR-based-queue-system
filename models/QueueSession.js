import mongoose from "mongoose";

const QueueSessionSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "paused", "closed"],
      default: "active",
    },

    currentToken: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.QueueSession ||
  mongoose.model(
    "QueueSession",
    QueueSessionSchema
  );