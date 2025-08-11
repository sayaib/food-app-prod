import express from 'express';
import { getDeviceStats, getConnectedDevices } from '../socket/socketServer.js';
import { getConnectedUsersCount, getConnectedPartnersCount } from '../socket/orderTrackingSocket.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

/**
 * GET /api/socket-stats/devices
 * Get current connected devices statistics
 */
router.get('/devices', (req, res) => {
  try {
    const stats = getDeviceStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting device stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/socket-stats/summary
 * Get summary of all socket connections with database totals
 */
router.get('/summary', async (req, res) => {
  try {
    const deviceStats = getDeviceStats();
    const orderTrackingUsers = getConnectedUsersCount();
    const orderTrackingPartners = getConnectedPartnersCount();
    
    // Get database counts
    const [totalUsersInDB, totalRestaurantsInDB, totalDeliveryPartnersInDB] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments(),
      User.countDocuments({ role: 'delivery' })
    ]);
    
    const summary = {
      database: {
        totalUsers: totalUsersInDB,
        totalRestaurants: totalRestaurantsInDB,
        totalDeliveryPartners: totalDeliveryPartnersInDB
      },
      liveConnections: {
        totalConnected: deviceStats.totalConnected + orderTrackingUsers + orderTrackingPartners,
        users: deviceStats.users + orderTrackingUsers,
        partners: deviceStats.partners + orderTrackingPartners,
        restaurants: deviceStats.restaurants,
        admins: deviceStats.admins
      },
      mainSocket: {
        totalConnected: deviceStats.totalConnected,
        users: deviceStats.users,
        partners: deviceStats.partners,
        restaurants: deviceStats.restaurants,
        admins: deviceStats.admins
      },
      orderTracking: {
        users: orderTrackingUsers,
        partners: orderTrackingPartners,
        total: orderTrackingUsers + orderTrackingPartners
      }
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting socket summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get socket summary',
      error: error.message
    });
  }
});

/**
 * GET /api/socket-stats/devices/list
 * Get list of all connected devices with details
 */
router.get('/devices/list', (req, res) => {
  try {
    const devices = getConnectedDevices();
    res.json({
      success: true,
      data: devices,
      count: devices.length
    });
  } catch (error) {
    console.error('Error getting devices list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get devices list',
      error: error.message
    });
  }
});

/**
 * GET /api/socket-stats/live-count
 * Get real-time count of connected devices (used by sendDeliveryToAllDevices)
 */
router.get('/live-count', (req, res) => {
  try {
    const deviceStats = getDeviceStats();
    const orderTrackingUsers = getConnectedUsersCount();
    const orderTrackingPartners = getConnectedPartnersCount();
    
    const liveCount = {
      totalConnected: deviceStats.totalConnected + orderTrackingUsers + orderTrackingPartners,
      deliveryPartners: deviceStats.partners + orderTrackingPartners,
      users: deviceStats.users + orderTrackingUsers,
      restaurants: deviceStats.restaurants,
      admins: deviceStats.admins,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: liveCount
    });
  } catch (error) {
    console.error('Error getting live count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get live count',
      error: error.message
    });
  }
});

export default router;