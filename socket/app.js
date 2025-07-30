const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

const connectedPartners = new Map(); // Track active delivery partners

io.on("connection", (socket) => {
  console.log(`✅ Partner connected: ${socket.id}`);

  // Optionally store more partner metadata
  connectedPartners.set(socket.id, { connectedAt: new Date() });

  // Receive live location updates from the partner
  socket.on("locationUpdate", (location) => {
    console.log(`📍 Location from ${socket.id}:`, location);
    // Optional: Save to DB or forward to admin panel
  });

  // Partner accepts a delivery order
  socket.on("accept_order", (data) => {
    console.log(`📦 Order accepted by ${socket.id}:`, data);
    // Optional: Save status, notify restaurant, update order DB, etc.
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 Partner disconnected: ${socket.id}`);
    connectedPartners.delete(socket.id);
  });
});

/**
 * Emit a delivery request to a connected partner
 * @param {string} socketId - The socket ID of the delivery partner
 * @param {object} orderData - The delivery order data to send
 */
function sendDeliveryRequestToPartner(socketId, orderData) {
  if (io.sockets.sockets.has(socketId)) {
    io.to(socketId).emit("delivery_request", orderData);
    console.log(`📨 Delivery request sent to ${socketId}`);
  } else {
    console.warn(`❌ Cannot send to ${socketId}: Not connected`);
  }
}

// Route: Send a demo delivery request to all connected partners
app.get("/send-delivery", (req, res) => {
  const orderData = {
    orderId: "ORD1234",
    restaurant: "Pizza Hub1",
    address: "21, MG Road",
    amount: 499,
  };

  let sentCount = 0;

  connectedPartners.forEach((_partnerInfo, socketId) => {
    sendDeliveryRequestToPartner(socketId, orderData);
    sentCount++;
  });

  if (sentCount > 0) {
    res.send(`✅ Delivery request sent to ${sentCount} partner(s).`);
  } else {
    res.status(404).send("❌ No delivery partners connected.");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
