import express from "express";
import Order from "../models/Order.js";
import { sendDeliveryToAllPartners } from "../socket/socketServer.js";

// POST /api/order
// routes/order.js
const router = express.Router();
router.post("/saveOrder", async (req, res) => {
  try {
    const {
      sessionId,
      customerID,
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

    console.log("saveorder", userLocation);
    const newOrder = new Order({
      sessionId,
      customerID,
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

    console.log(newOrder);

    // prepare data for delivery partners
    const orderData = {
      orderId: newOrder._id.toString(),
      restaurantName: items?.[0]?.restaurantName || "Unknown Restaurant",
      address: restaurantFullAddress,
      amount: total_amount,
    };

    sendDeliveryToAllPartners(orderData);

    res.status(201).json({ message: "Order saved successfully" });
  } catch (error) {
    console.error("Order Save Error:", error.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// orders api based on session id

router.get("/orders/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const order = await Order.findOne({ sessionId });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
