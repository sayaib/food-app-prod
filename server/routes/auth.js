import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import generateOTP from "../utils/generateOTP.js";

const router = express.Router();

// Request OTP
router.post("/request-otp", async (req, res) => {
  const { email, phone, role } = req.body;
  console.log(req.body);
  if (!email && !phone) {
    return res.status(400).json({ msg: "Email or phone is required" });
  }

  // Only find user with the matching role
  const query = {
    $or: [],
    role, // role must match
  };

  if (email) query.$or.push({ email });
  if (phone) query.$or.push({ phone });

  if (query.$or.length === 0) {
    return res.status(400).json({ msg: "Invalid request" });
  }

  const user = await User.findOne(query);

  // Don't generate OTP if user not found with that role
  if (!user) {
    return res.status(403).json({
      msg: `User with ${email || phone} and role '${role}' not found`,
    });
  }

  // Generate and save OTP
  const otp = generateOTP();
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

//get all user data in pagination and regex search

// GET /api/restaurants?search=abc&page=1&limit=10
router.get("/getUserData", async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const query = search
    ? {
        $or: [
          { status: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [restaurants, total] = await Promise.all([
    User.find(query).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    data: restaurants,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

//delete user data

router.delete("/deleteUser/:id/:role", async (req, res) => {
  const { id, role } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", id });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//add admin user only

router.post("/addAdminUser", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({
      name,
      email,
      phone,
      role: "admin",
      isVerified: true,
      otp: null,
    });

    await user.save();

    res.status(201).json({ message: "Admin added successfully" });
  } catch (err) {
    console.error("Error adding admin:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
