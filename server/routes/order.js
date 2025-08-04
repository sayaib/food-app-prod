import express from "express";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
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
      restaurantId,
    } = req.body;

    console.log("saveorder", restaurantId);
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
      restaurantId,
      status: "placed",
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

router.get("/restaurant/:id", async (req, res) => {
  try {
    // Step 1: Find restaurant by userID
    const restaurant = await Restaurant.findOne({ userID: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Step 2: Find orders by restaurantId
    const orders = await Order.find({
      restaurantId: restaurant._id,
      status: "placed", // optional filter
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Accept an order (change status)
router.put("/status/:orderId/", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: req.body.status, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
