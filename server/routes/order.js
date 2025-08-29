import express from "express";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import Coupon from "../models/Coupon.js";
import {
  sendDeliveryToAllDevices,
  sendDeliveryToAllPartners,
} from "../socket/socketServer.js";
import calculateRouteInfo from "../utils/calculateRouteInfo.js";
import authMiddleware from "../middleware/auth.js";

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
      appliedCoupon,
      restaurantId,
      orderBreakdown, // Include order breakdown from checkout
    } = req.body;

    // console.log("saveorder", restaurantId);
    console.log("orderBreakdown Show", orderBreakdown);

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
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountAmount: appliedCoupon.discountAmount,
        couponId: appliedCoupon.couponData?._id
      } : null,
      restaurantId,
      status: "placed",
      deliveredOTP: Math.floor(1000 + Math.random() * 9000),
      isOtpVerified: false,
      orderBreakdown: orderBreakdown,
    });

    await newOrder.save();

    // Track coupon usage if a coupon was applied
    if (orderBreakdown?.couponCode && userId) {
      try {
        const coupon = await Coupon.findOne({ code: orderBreakdown.couponCode.toUpperCase() });
        if (coupon) {
          // Add user to usedBy array if not already present
          if (!coupon.usedBy.some(usage => usage.userId.toString() === userId)) {
            coupon.usedBy.push({ userId, usedAt: new Date() });
            coupon.totalUsed += 1;
            await coupon.save();
            console.log(`Coupon ${coupon.code} usage tracked for user ${userId}`);
          }
        }
      } catch (couponError) {
        console.error('Error tracking coupon usage:', couponError);
        // Don't fail the order if coupon tracking fails
      }
    }

    console.log("Order saved with breakdown:", newOrder);

    // prepare data for delivery partners
    const orderData = {
      orderId: newOrder._id.toString(),
      restaurantName: items?.[0]?.restaurantName || "Unknown Restaurant",
      address: restaurantFullAddress,
      amount: total_amount,
    };

    sendDeliveryToAllDevices(orderData);

    res.status(201).json({
      message: "Order saved successfully",
      orderId: newOrder._id,
      orderBreakdown: newOrder.orderBreakdown,
    });
  } catch (error) {
    console.error("Order Save Error:", error.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// orders api based on session id

router.get("/orders/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const order = await Order.findOne({ sessionId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const routeInfo = await calculateRouteInfo(
      order?.deliveryLocation?.coordinates,
      order?.restaurantLocation?.coordinates,
      order?.userLocation?.coordinates
    );

    res.json({
      order,
      routeInfo,
    });
  } catch (error) {
    console.error("Error fetching order/route info:", error);
    res.status(500).json({ error: "Server error" });
  }
});

///////////////////

router.get("/restaurant/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    // Step 1: Find restaurant by userID
    const restaurant = await Restaurant.findOne({ userID: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Step 2: Find orders by restaurantId
    const orders = await Order.find({
      restaurantId: restaurant._id,
    }).sort({ createdAt: -1 });

    console.log(orders);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// current order
router.get("/currentOrder/:id", async (req, res) => {
  try {
    const ongoingStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "picked_up",
      "out_for_delivery",
    ];

    // Get all matching ongoing orders
    const orders = await Order.find({
      userId: req.params.id,
      status: { $in: ongoingStatuses },
    }).sort({ createdAt: -1 });

    // Calculate route info for each order in parallel
    const ordersWithRoutes = await Promise.all(
      orders.map(async (order) => {
        const routeInfo = await calculateRouteInfo(
          order?.deliveryLocation?.coordinates,
          order?.restaurantLocation?.coordinates,
          order?.userLocation?.coordinates
        );

        return {
          order,
          routeInfo,
        };
      })
    );
    console.log(ordersWithRoutes);
    res.json(ordersWithRoutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Accept an order (change status)
router.put("/status/:orderId/", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status: req.body.status,
        statusUpdatedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Import here to avoid circular dependency
    const { broadcastOrderStatusUpdate } = await import(
      "../socket/orderTrackingSocket.js"
    );

    // Broadcast the status update to all subscribers
    broadcastOrderStatusUpdate(req.params.orderId, req.body.status);

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Update delivery instructions
router.put("/delivery-instructions/:orderId", async (req, res) => {
  try {
    const { deliveryInstructions } = req.body;
    
    // Validate instruction length
    if (deliveryInstructions && deliveryInstructions.length > 500) {
      return res.status(400).json({ error: "Delivery instructions must be 500 characters or less" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        deliveryInstructions: deliveryInstructions || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ 
      message: "Delivery instructions updated successfully",
      deliveryInstructions: updatedOrder.deliveryInstructions 
    });
  } catch (err) {
    console.error("Error updating delivery instructions:", err);
    res.status(500).json({ error: "Failed to update delivery instructions" });
  }
});

// Submit rating for order
router.post("/rating/:orderId", async (req, res) => {
  try {
    const { restaurantRating, deliveryRating, comment } = req.body;
    
    // Validate ratings
    if (!restaurantRating || !deliveryRating || 
        restaurantRating < 1 || restaurantRating > 5 || 
        deliveryRating < 1 || deliveryRating > 5) {
      return res.status(400).json({ error: "Both ratings must be between 1 and 5" });
    }

    // Validate comment length
    if (comment && comment.length > 500) {
      return res.status(400).json({ error: "Comment must be 500 characters or less" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        rating: {
          restaurant: restaurantRating,
          delivery: deliveryRating,
          comment: comment || "",
          submittedAt: new Date()
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ 
      message: "Rating submitted successfully",
      rating: updatedOrder.rating 
    });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

export default router;
