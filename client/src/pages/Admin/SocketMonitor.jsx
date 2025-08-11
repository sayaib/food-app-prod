import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import {
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Users,
  Activity,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  User,
  Truck,
} from "lucide-react";
import AdminLayout from "../../components/Admin/AdminLayout";

const SocketMonitor = () => {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [socketStats, setSocketStats] = useState({
    totalConnected: 0,
    users: 0,
    partners: 0,
    restaurants: 0,
  });
  const [databaseStats, setDatabaseStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalDeliveryPartners: 0
  });
  const [liveStats, setLiveStats] = useState({
    totalConnected: 0,
    users: 0,
    partners: 0,
    restaurants: 0
  });
  const [deliveryBroadcastStats, setDeliveryBroadcastStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const socketRef = useRef(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Initialize socket connection for admin monitoring
    // Connect to the main socket server (not the order tracking one)
    const socket = io(window.location.origin.replace('5173', '5050'), {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Admin socket connected for monitoring");
      setIsConnected(true);

      // Authenticate as admin
      socket.emit("admin_authenticate", { adminId: "admin-dashboard" });
    });

    socket.on("admin_authentication_success", () => {
      console.log("Admin authentication successful");
      // Request current connected devices info
      socket.emit("admin_request_devices_info");
    });

    socket.on("disconnect", () => {
      console.log("Admin socket disconnected");
      setIsConnected(false);
    });

    socket.on("devices_info_update", (data) => {
      console.log("Received devices info:", data);
      setConnectedDevices(data.devices || []);
      setSocketStats(
        data.stats || {
          totalConnected: 0,
          users: 0,
          partners: 0,
          restaurants: 0,
        }
      );
      setLastUpdate(new Date());
      
      // Also fetch database and live stats
      fetchSummaryStats();
    });

    socket.on("device_connected", (deviceInfo) => {
      console.log("New device connected:", deviceInfo);
      setConnectedDevices((prev) => {
        // Check if device already exists to avoid duplicates
        const exists = prev.some(
          (device) => device.socketId === deviceInfo.socketId
        );
        if (!exists) {
          return [...prev, deviceInfo];
        }
        return prev;
      });
      setLastUpdate(new Date());
    });

    socket.on("device_disconnected", (deviceInfo) => {
      console.log("Device disconnected:", deviceInfo);
      setConnectedDevices((prev) =>
        prev.filter((device) => device.socketId !== deviceInfo.socketId)
      );
      setLastUpdate(new Date());
    });

    socket.on("device_updated", (deviceInfo) => {
      console.log("Device updated:", deviceInfo);
      setConnectedDevices((prev) =>
        prev.map((device) =>
          device.socketId === deviceInfo.socketId ? deviceInfo : device
        )
      );
      setLastUpdate(new Date());
    });
    
    socket.on('delivery_broadcast_stats', (stats) => {
      console.log('Delivery broadcast stats received:', stats);
      setDeliveryBroadcastStats(stats);
      setLastUpdate(new Date());
      
      // Clear the stats after 10 seconds
      setTimeout(() => {
        setDeliveryBroadcastStats(null);
      }, 10000);
    });

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh && socket.connected) {
        socket.emit("admin_request_devices_info");
        fetchSummaryStats();
      }
    }, 30000);
    
    // Initial fetch of summary stats
    fetchSummaryStats();

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [autoRefresh]);

  const updateStats = (change, deviceType) => {
    setSocketStats((prev) => ({
      ...prev,
      totalConnected: prev.totalConnected + change,
      [deviceType]: (prev[deviceType] || 0) + change,
    }));
    setLastUpdate(new Date());
  };

  const fetchSummaryStats = async () => {
    try {
      const response = await fetch('/api/socket-stats/summary');
      const data = await response.json();
      
      if (data.success) {
        setDatabaseStats(data.data.database);
        setLiveStats(data.data.liveConnections);
      }
    } catch (error) {
      console.error('Error fetching summary stats:', error);
    }
  };

  const handleRefresh = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('admin_request_devices_info');
    }
    fetchSummaryStats();
  };
  
  const handleTestDelivery = async () => {
    try {
      const response = await fetch('/api/socket/send-delivery');
      const data = await response.json();
      
      if (data.success) {
        console.log('Test delivery broadcast successful:', data);
        // The delivery_broadcast_stats event will be received via socket
      } else {
        console.error('Test delivery broadcast failed:', data.message);
      }
    } catch (error) {
      console.error('Error testing delivery broadcast:', error);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "user":
        return <User className="h-5 w-5 text-blue-500" />;
      case "partner":
        return <Truck className="h-5 w-5 text-green-500" />;
      case "restaurant":
        return <Monitor className="h-5 w-5 text-purple-500" />;
      default:
        return <Smartphone className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDeviceTypeColor = (type) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "partner":
        return "bg-green-100 text-green-800 border-green-200";
      case "restaurant":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const StatCard = ({ icon, title, value, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <AdminLayout
      title="Socket Monitor"
      description="Real-time monitoring of connected devices and socket connections"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Auto Refresh
            </label>
          </div>
          <button
            onClick={handleTestDelivery}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Truck className="h-4 w-4" />
            Test Delivery Broadcast
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <span className="text-green-700 font-medium">
                  Connected to Socket Server
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-red-500" />
                <span className="text-red-700 font-medium">
                  Disconnected from Socket Server
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Last updated: {formatTime(lastUpdate)}
          </div>
        </div>

        {/* Database Statistics Cards */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Database Totals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<User className="h-6 w-6 text-blue-600" />}
              title="Total Users"
              value={databaseStats.totalUsers}
              color="blue"
            />
            <StatCard
              icon={<Monitor className="h-6 w-6 text-green-600" />}
              title="Total Restaurants"
              value={databaseStats.totalRestaurants}
              color="green"
            />
            <StatCard
              icon={<Truck className="h-6 w-6 text-purple-600" />}
              title="Total Delivery Partners"
              value={databaseStats.totalDeliveryPartners}
              color="purple"
            />
          </div>
        </div>

        {/* Live Connection Statistics Cards */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Live Connections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Activity className="h-6 w-6 text-red-600" />}
              title="Total Connected"
              value={liveStats.totalConnected}
              color="red"
            />
            <StatCard
              icon={<User className="h-6 w-6 text-blue-600" />}
              title="Connected Users"
              value={liveStats.users}
              color="blue"
            />
            <StatCard
              icon={<Truck className="h-6 w-6 text-green-600" />}
              title="Connected Partners"
              value={liveStats.partners}
              color="green"
            />
            <StatCard
              icon={<Monitor className="h-6 w-6 text-orange-600" />}
              title="Connected Restaurants"
              value={liveStats.restaurants}
              color="orange"
            />
          </div>
        </div>

        {/* Delivery Broadcast Stats */}
        {deliveryBroadcastStats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-md border border-green-200 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                Latest Delivery Broadcast
              </h3>
              <div className="text-sm text-gray-500">
                {new Date(deliveryBroadcastStats.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{deliveryBroadcastStats.totalDevices}</div>
                <div className="text-sm text-gray-600">Total Notified</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{deliveryBroadcastStats.deliveryPartners}</div>
                <div className="text-sm text-gray-600">Partners</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">{deliveryBroadcastStats.users}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-orange-600">{deliveryBroadcastStats.restaurants}</div>
                <div className="text-sm text-gray-600">Restaurants</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ {deliveryBroadcastStats.message}
              </span>
            </div>
          </motion.div>
        )}

        {/* Connected Devices Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-red-500" />
              Connected Devices ({connectedDevices.length})
            </h3>
          </div>

          {connectedDevices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No devices connected</p>
              <p className="text-sm">
                Devices will appear here when they connect to the socket server.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Socket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Connected At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectedDevices.map((device, index) => (
                    <motion.tr
                      key={device.socketId || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.type)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {device.userId ||
                                device.partnerId ||
                                device.restaurantId ||
                                "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {device.userAgent || "Unknown Device"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDeviceTypeColor(
                            device.type
                          )}`}
                        >
                          {device.type || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {device.socketId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.connectedAt
                          ? formatTime(new Date(device.connectedAt))
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SocketMonitor;
