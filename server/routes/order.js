import express from "express";
import Order from "../models/Order.js";

// POST /api/order
// routes/order.js
const router = express.Router();
router.post("/saveOrder", async (req, res) => {
  try {
    const {
      sessionId,
      customer_email,
      total_amount,
      payment_status,
      items,
      userId,
      userFullAddress,
      userLocation,
      restaurantFullAddress,
      restaurantLocation,
      promoCode,
    } = req.body;

    console.log("saveorder", req.body);
    const newOrder = new Order({
      sessionId,
      customer_email,
      total_amount,
      payment_status,
      items,
      userId,
      userFullAddress,
      userLocation,
      restaurantFullAddress,
      restaurantLocation,
      promoCode,
    });

    await newOrder.save();

    res.status(201).json({ message: "Order saved successfully" });
  } catch (error) {
    console.error("Order Save Error:", error.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

export default router;
