import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import generateOTP from "../utils/generateOTP.js";

const router = express.Router();

// Request OTP
router.post("/request-otp", async (req, res) => {
  const { email, phone } = req.body;
  const otp = generateOTP();

  let user = await User.findOne({ $or: [{ email }, { phone }] });

  if (!user) {
    return res.json({ msg: "User not found", newUser: true, otp }); // show OTP anyway for testing
  }

  user.otp = otp;
  await user.save();

  return res.json({ msg: "OTP sent", otp, newUser: false });
});

// Verify OTP & Login
router.post("/verify-otp", async (req, res) => {
  const { email, phone, otp } = req.body;
  const user = await User.findOne({ $or: [{ email }, { phone }], otp });

  if (!user) return res.status(400).json({ msg: "Invalid OTP" });

  user.otp = null;
  user.isVerified = true;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return res.json({ token, user: { id: user._id, role: user.role } });
});

// Register with OTP
router.post("/register", async (req, res) => {
  const { name, email, phone, otp } = req.body;
  const existing = await User.findOne({ $or: [{ email }, { phone }] });

  if (existing) return res.status(400).json({ msg: "User already exists" });
  if (!otp || otp !== req.body.otp)
    return res.status(400).json({ msg: "Invalid OTP" });

  const newUser = new User({
    name,
    email,
    phone,
    role: "user",
    isVerified: true,
  });

  await newUser.save();

  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return res.json({ token, user: { id: newUser._id, role: newUser.role } });
});

export default router;
