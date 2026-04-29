import mongoose from "mongoose";

const QueueEntrySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QueueSession",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "called",
        "completed",
        "skipped",
        "cancelled",
      ],
      default: "waiting",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.QueueEntry ||
  mongoose.model(
    "QueueEntry",
    QueueEntrySchema
  );