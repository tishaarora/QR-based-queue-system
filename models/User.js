import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  googleId: String,

  email: {
    type: String,
    unique: true
  },

  displayName: String,

  phoneNumber: String,

  profileCompleted: {
    type: Boolean,
    default: false
  }
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);