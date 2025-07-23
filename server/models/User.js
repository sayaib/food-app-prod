import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["user", "admin", "restaurant"],
    default: "user",
  },
  otp: String,
  isVerified: { type: Boolean, default: false },

  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
});

export default mongoose.model("User", userSchema);
