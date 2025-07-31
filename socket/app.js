// socketServer.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const connectedPartners = new Map();

function startSocketServer(port = 6000) {
  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Partner connected: ${socket.id}`);
    connectedPartners.set(socket.id, { connectedAt: new Date() });

    socket.on("locationUpdate", (location) => {
      console.log(`📍 Location from ${socket.id}:`, location);
    });

    socket.on("accept_order", (data) => {
      console.log(`📦 Order accepted by ${socket.id}:`, data);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Partner disconnected: ${socket.id}`);
      connectedPartners.delete(socket.id);
    });
  });

  function sendDeliveryRequestToPartner(socketId, orderData) {
    if (io.sockets.sockets.has(socketId)) {
      io.to(socketId).emit("delivery_request", orderData);
      console.log(`📨 Delivery request sent to ${socketId}`);
    } else {
      console.warn(`❌ Cannot send to ${socketId}: Not connected`);
    }
  }

  // Optional route for testing delivery broadcast
  app.get("/send-delivery", (req, res) => {
    const orderData = {
      orderId: "ORD1234",
      restaurant: "Pizza Hub1",
      address: "21, MG Road",
      amount: 499,
    };

    let sentCount = 0;
    connectedPartners.forEach((_info, socketId) => {
      sendDeliveryRequestToPartner(socketId, orderData);
      sentCount++;
    });

    if (sentCount > 0) {
      res.send(`✅ Delivery request sent to ${sentCount} partner(s).`);
    } else {
      res.status(404).send("❌ No delivery partners connected.");
    }
  });

  server.listen(port, () => {
    console.log(`🚀 Socket.IO server running on http://localhost:${port}`);
  });
}

module.exports = startSocketServer;
