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
  },

  pushSubscription: {
    type: Object,
    default: null,
  },

});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);