import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import generateOTP from "../utils/generateOTP.js";

const router = express.Router();

// Request OTP
router.post("/request-otp", async (req, res) => {
  const { email, phone } = req.body;
  const otp = generateOTP();

  const orConditions = [];
  if (email) orConditions.push({ email });
  if (phone) orConditions.push({ phone });

  if (orConditions.length === 0) {
    return res.status(400).json({ msg: "Email or phone is required" });
  }

  const user = await User.findOne({ $or: orConditions });

  if (!user) {
    return res.json({ msg: "User not found", newUser: true, otp }); // show OTP anyway for testing
  }
  console.log(user);

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
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// Register with OTP
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, otp, role } = req.body;

    // Basic validation
    if (!name || !otp || (!email && !phone)) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email || null }, { phone: phone || null }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });
    }

    // Replace with real OTP validation logic
    if (otp !== req.body.otp) {
      return res.status(400).json({ success: false, msg: "Invalid OTP" });
    }

    // Create and save the user
    const newUser = new User({
      name,
      email,
      phone,
      role: role,
      isVerified: true,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      msg: "Registration successful. Please login to continue.",
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

export default router;
