import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import generateOTP from "../utils/generateOTP.js";
import Order from "../models/Order.js";

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

    console.log(req.body);

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

// Get order by ID for delivery boy
router.get("/getCurrentOrderForDeliveryBoy/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /delivery/verify-otp
router.post("/delivery/verify-otp", async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    console.log("Incoming request:", req.body);

    // 1. Validate inputs
    if (!orderId || !otp) {
      return res.status(400).json({
        success: false,
        message: "orderId and otp are required",
      });
    }

    // 2. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    console.log(order.deliveredOTP, Number(otp)); //
    // 3. Match OTP
    if (order?.deliveredOTP !== Number(otp)) {
      console.log("invalid");
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    console.log("not invalid");
    // 4. Update order status
    order.isOtpVerified = true;
    await order.save();

    // 5. Success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// POST API to get delivery amount by driverId
router.post("/delivery/get-delivery-amount", async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: "driverId is required" });
    }

    // Find all orders assigned to this driver
    const orders = await Order.find({ driverId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this driver" });
    }

    // Map orders into response array
    const responseData = orders.map((order) => {
      const deliveryFee = order.orderBreakdown?.fees?.find(
        (f) => f.type === "delivery_fee"
      );

      return {
        orderId: order._id,
        customerEmail: order.customer_email,
        status: order.status,
        deliveryAmount: deliveryFee ? deliveryFee.amount : 0,
        finalTotal: order.orderBreakdown?.finalTotal || 0,
        restaurantAddress: order.restaurantFullAddress,
        userAddress: order.userFullAddress,
      };
    });

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ping", (req, res) => {
  console.log("called...");
  res.send("Server reachable");
});

export default router;
