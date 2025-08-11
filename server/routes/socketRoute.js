import express from "express";
import {
  sendDeliveryToAllDevices,
  sendDeliveryToAllPartners,
} from "../socket/socketServer.js";

const router = express.Router();
// Test route to trigger delivery
router.get("/send-delivery", (req, res) => {
  console.log("🚚 /send-delivery endpoint hit");

  const orderData = {
    orderId: "689a25b053f36baca6c3dff1",
    restaurantName: "Pizza Hub1",
    address: "21, MG Road",
    amount: 499,
  };

  const result = sendDeliveryToAllDevices(orderData);
  console.log("📊 Delivery broadcast result:", result);

  res.setHeader("Cache-Control", "no-store");

  if (result.success && result.totalDevices > 0) {
    res.json({
      success: true,
      message: result.message,
      stats: {
        totalDevices: result.totalDevices,
        deliveryPartners: result.deliveryPartners,
        users: result.users,
        restaurants: result.restaurants,
        timestamp: result.timestamp
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: result.message || "❌ No devices connected.",
      stats: {
        totalDevices: 0,
        deliveryPartners: 0,
        users: 0,
        restaurants: 0
      }
    });
  }
});

// New route to get current live delivery partner count (used by sendDeliveryToAllDevices)
router.get("/live-delivery-count", (req, res) => {
  console.log("📊 /live-delivery-count endpoint hit");
  
  const result = sendDeliveryToAllDevices({ test: true, skipBroadcast: true });
  
  res.json({
    success: true,
    liveCount: {
      totalDevices: result.totalDevices,
      deliveryPartners: result.deliveryPartners,
      users: result.users,
      restaurants: result.restaurants,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
