import mongoose from "mongoose";

const BusinessProfileSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  businessName: {
    type: String,
    required: true
  }
});

export default mongoose.models.BusinessProfile ||
  mongoose.model(
    "BusinessProfile",
    BusinessProfileSchema
  );