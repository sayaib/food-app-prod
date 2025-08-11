// socket/socketServer.js

import { Server } from "socket.io";
import Order from "../models/Order.js";

// Map to store all connected devices: socketId => socket instance
const connectedSockets = new Map();
// Map to store device information for admin monitoring
const deviceInfo = new Map();
// Set to store admin socket IDs
const adminSockets = new Set();

let io = null;

/**
 * Initialize the Socket.IO server
 */
export function setupSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const socketId = socket.id;

    console.log("✅ New device connected");
    console.log("   • Socket ID:", socketId);

    // Store socket in the map
    connectedSockets.set(socketId, socket);
    
    // Initialize device info
    const deviceData = {
      socketId,
      connectedAt: new Date(),
      type: 'unknown',
      userAgent: socket.handshake.headers['user-agent'] || 'Unknown',
      ipAddress: socket.handshake.address
    };
    deviceInfo.set(socketId, deviceData);
    
    // Notify admins about new device
    broadcastToAdmins('device_connected', deviceData);

    /**
     * 🛰️ Handle location updates from the device
     * Payload: { lat: Number, lon: Number }
     */
    socket.on("updateLocation", async (location) => {
      console.log(`📍 Location update from ${socketId}:`, location);

      if (!location?.latitude || !location?.longitude) {
        console.warn(`⚠️ Invalid location from ${socketId}`);
        return;
      }

      try {
        if (location.orderId !== "") {
          const updatedOrder = await Order.findOneAndUpdate(
            { _id: location.orderId }, // Ensure your Order model includes a socketId field
            {
              $set: {
                deliveryLocation: {
                  type: "Point",
                  coordinates: [location.longitude, location.latitude],
                },
              },
            },
            { new: true }
          );

          if (updatedOrder) {
            console.log(`✅ Order location updated for ${socketId}`);
          } else {
            console.warn(`⚠️ No matching order for socket ID ${socketId}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error updating location for ${socketId}:`, err);
      }
    });

    /**
     * 📦 Handle order acceptance
     * Payload: { orderId, status, ... }
     */

    socket.on("delivery_response", (data) => {
      console.log("response", data);
    });
    socket.on("new_delivery_request", (data) => {
      console.log(`📦 Delivery request accepted by ${socketId}:`, data);
      // Optional: Save acceptance in DB or notify customer
    });

    /**
     * 🔐 Handle admin authentication
     */
    socket.on("admin_authenticate", (data) => {
      console.log(`🔐 Admin authenticated: ${socketId}`);
      adminSockets.add(socketId);
      
      // Update device info
      const device = deviceInfo.get(socketId);
      if (device) {
        device.type = 'admin';
        device.adminId = data.adminId || 'unknown';
        deviceInfo.set(socketId, device);
      }
      
      socket.emit('admin_authentication_success');
    });
    
    /**
     * 📊 Handle admin request for devices info
     */
    socket.on("admin_request_devices_info", () => {
      if (!adminSockets.has(socketId)) {
        socket.emit('error', { message: 'Admin authentication required' });
        return;
      }
      
      const devices = Array.from(deviceInfo.values());
      const stats = {
        totalConnected: devices.length,
        users: devices.filter(d => d.type === 'user').length,
        partners: devices.filter(d => d.type === 'partner').length,
        restaurants: devices.filter(d => d.type === 'restaurant').length,
        admins: devices.filter(d => d.type === 'admin').length
      };
      
      socket.emit('devices_info_update', { devices, stats });
    });
    
    /**
     * 👤 Handle user authentication
     */
    socket.on("authenticate_user", (data) => {
      console.log(`👤 User authenticated: ${socketId}`);
      
      const device = deviceInfo.get(socketId);
      if (device) {
        device.type = 'user';
        device.userId = data.userId;
        deviceInfo.set(socketId, device);
        broadcastToAdmins('device_updated', device);
      }
    });
    
    /**
     * 🚚 Handle partner authentication
     */
    socket.on("authenticate_partner", (data) => {
      console.log(`🚚 Partner authenticated: ${socketId}`);
      
      const device = deviceInfo.get(socketId);
      if (device) {
        device.type = 'partner';
        device.partnerId = data.partnerId;
        deviceInfo.set(socketId, device);
        broadcastToAdmins('device_updated', device);
      }
    });
    
    /**
     * 🏪 Handle restaurant authentication
     */
    socket.on("authenticate_restaurant", (data) => {
      console.log(`🏪 Restaurant authenticated: ${socketId}`);
      
      const device = deviceInfo.get(socketId);
      if (device) {
        device.type = 'restaurant';
        device.restaurantId = data.restaurantId;
        deviceInfo.set(socketId, device);
        broadcastToAdmins('device_updated', device);
      }
    });

    /**
     * ❌ Handle disconnection
     */
    socket.on("disconnect", () => {
      console.log(`🔌 Device disconnected: ${socketId}`);
      
      const device = deviceInfo.get(socketId);
      if (device) {
        broadcastToAdmins('device_disconnected', device);
      }
      
      connectedSockets.delete(socketId);
      deviceInfo.delete(socketId);
      adminSockets.delete(socketId);
    });
  });

  console.log("🚀 Socket.IO server initialized");
}

/**
 * 🔄 Send order request to all connected sockets
 * @param {Object} orderData - order details to send
 * @param {Object} options - additional options like skipBroadcast
 * @returns {Object} delivery broadcast result with counts
 */
export function sendDeliveryToAllDevices(orderData, options = {}) {
  if (!io) {
    console.warn("⚠️ Socket.IO not initialized.");
    return {
      success: false,
      totalDevices: 0,
      deliveryPartners: 0,
      users: 0,
      restaurants: 0,
      message: "Socket.IO not initialized"
    };
  }

  let totalCount = 0;
  let partnerCount = 0;
  let userCount = 0;
  let restaurantCount = 0;

  // Send to all connected devices and count by type
    for (const [socketId, socket] of connectedSockets.entries()) {
      const deviceData = deviceInfo.get(socketId);
      const deviceType = deviceData?.type || 'unknown';
     
     // Only send actual delivery requests if not in test mode
     if (!orderData.test && !options.skipBroadcast) {
       socket.emit("new_delivery_request", orderData);
       console.log(`📨 Sent delivery request to ${socketId} (${deviceType})`);
     }
     
     totalCount++;
     
     // Count by device type
     switch (deviceType) {
       case 'partner':
         partnerCount++;
         break;
       case 'user':
         userCount++;
         break;
       case 'restaurant':
         restaurantCount++;
         break;
     }
   }

  const result = {
    success: true,
    totalDevices: totalCount,
    deliveryPartners: partnerCount,
    users: userCount,
    restaurants: restaurantCount,
    timestamp: new Date().toISOString(),
    message: `Delivery request sent to ${totalCount} device(s)`
  };
  
  // Broadcast delivery stats to admin clients (unless in test mode)
   if (!orderData.test && !options.skipBroadcast) {
     broadcastToAdmins('delivery_broadcast_stats', result);
     console.log(`📊 Delivery broadcast stats:`, result);
   } else {
     console.log(`📊 Live count check:`, result);
   }
  
  return result;
}

/**
 * 🎯 Send order request to a specific socket ID
 * @param {string} socketId - target device socket ID
 * @param {Object} orderData - order details
 * @returns {boolean} success
 */
export function sendDeliveryToAllPartners(socketId, orderData) {
  const socket = connectedSockets.get(socketId);

  if (socket) {
    socket.emit("new_delivery_request", orderData);
    console.log(`📨 Sent delivery request to ${socketId}`);
    return true;
  } else {
    console.warn(`⚠️ Socket ID ${socketId} not connected`);
    return false;
  }
}

/**
 * 📢 Broadcast message to all admin sockets
 * @param {string} event - event name
 * @param {Object} data - data to send
 */
function broadcastToAdmins(event, data) {
  adminSockets.forEach(adminSocketId => {
    const adminSocket = connectedSockets.get(adminSocketId);
    if (adminSocket) {
      adminSocket.emit(event, data);
    }
  });
}

/**
 * 📊 Get current device statistics
 * @returns {Object} device statistics
 */
export function getDeviceStats() {
  const devices = Array.from(deviceInfo.values());
  return {
    totalConnected: devices.length,
    users: devices.filter(d => d.type === 'user').length,
    partners: devices.filter(d => d.type === 'partner').length,
    restaurants: devices.filter(d => d.type === 'restaurant').length,
    admins: devices.filter(d => d.type === 'admin').length,
    devices
  };
}

/**
 * 📱 Get all connected devices info
 * @returns {Array} array of device information
 */
export function getConnectedDevices() {
  return Array.from(deviceInfo.values());
}
