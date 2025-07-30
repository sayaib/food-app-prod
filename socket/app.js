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

  // Optionally store more partner metadata here
  connectedPartners.set(socket.id, { connectedAt: new Date() });

  // Handle incoming live location updates
  socket.on("locationUpdate", (location) => {
    console.log(`📍 Location from ${socket.id}:`, location);
    // Optionally: store to DB or forward to admin
  });

  // Handle delivery order acceptance
  socket.on("accept_order", (data) => {
    console.log(`📦 Order accepted by ${socket.id}:`, data);
    // Optionally: save status, notify restaurant etc.
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Partner disconnected: ${socket.id}`);
    connectedPartners.delete(socket.id);
  });
});

/**
 * Emit delivery request to a connected partner
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

// Demo route: Trigger a delivery request
app.get("/send-delivery", (req, res) => {
  const [socketId] = connectedPartners.keys(); // Just use first partner for demo
  const orderData = {
    orderId: "ORD123",
    restaurant: "Pizza Hub",
    address: "21, MG Road",
    amount: 499,
  };

  if (socketId) {
    sendDeliveryRequestToPartner(socketId, orderData);
    res.send(`✅ Delivery request sent to partner: ${socketId}`);
  } else {
    res.status(404).send("❌ No delivery partner connected.");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
