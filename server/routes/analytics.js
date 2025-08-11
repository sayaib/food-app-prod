import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get admin analytics data
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get today's date for daily metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalRestaurants,
      activeRestaurants,
      totalUsers,
      ordersByStatus,
      recentOrders,
      ordersByHour,
      topRestaurants,
      orderTrends
    ] = await Promise.all([
      // Total orders in date range
      Order.countDocuments({
        createdAt: { $gte: start, $lte: end }
      }),
      
      // Today's orders
      Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Total revenue in date range
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: start, $lte: end },
          payment_status: "paid"
        }},
        { $group: { _id: null, total: { $sum: "$total_amount" } }}
      ]),
      
      // Today's revenue
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: today, $lt: tomorrow },
          payment_status: "paid"
        }},
        { $group: { _id: null, total: { $sum: "$total_amount" } }}
      ]),
      
      // Total restaurants
      Restaurant.countDocuments(),
      
      // Active restaurants
      Restaurant.countDocuments({ status: "active" }),
      
      // Total users
      User.countDocuments({ role: "user" }),
      
      // Orders by status
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } }},
        { $group: { _id: "$status", count: { $sum: 1 } }}
      ]),
      
      // Recent orders (last 20)
      Order.find({
        createdAt: { $gte: start, $lte: end }
      })
      .populate('restaurantId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20),
      
      // Orders by hour (today)
      Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow } }},
        { 
          $group: { 
            _id: { $hour: "$createdAt" }, 
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$total_amount", 0] }}
          }
        },
        { $sort: { "_id": 1 }}
      ]),
      
      // Top restaurants by orders
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } }},
        { $group: { 
          _id: "$restaurantId", 
          orderCount: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$total_amount", 0] }}
        }},
        { $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurant"
        }},
        { $unwind: "$restaurant" },
        { $sort: { orderCount: -1 }},
        { $limit: 10 }
      ]),
      
      // Order trends (last 7 days)
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }},
        { 
          $group: { 
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }, 
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$total_amount", 0] }}
          }
        },
        { $sort: { "_id": 1 }}
      ])
    ]);

    // Calculate average delivery time for completed orders
    const completedOrders = await Order.find({
      status: "delivered",
      createdAt: { $gte: start, $lte: end }
    }).select('estimatedDeliveryTime');
    
    const avgDeliveryTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => sum + (order.estimatedDeliveryTime || 30), 0) / completedOrders.length
      : 30;

    // Calculate completion rate
    const completedOrdersCount = await Order.countDocuments({
      status: "delivered",
      createdAt: { $gte: start, $lte: end }
    });
    const completionRate = totalOrders > 0 ? (completedOrdersCount / totalOrders) * 100 : 0;

    // Format the response
    const analytics = {
      kpi: {
        ordersToday: todayOrders,
        totalOrders,
        revenueToday: todayRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeRestaurants,
        totalRestaurants,
        totalUsers,
        avgDeliveryTime: Math.round(avgDeliveryTime),
        completionRate: Math.round(completionRate)
      },
      ordersByStatus: ordersByStatus.map(item => ({
        status: item._id,
        count: item.count
      })),
      ordersByHour: Array.from({ length: 24 }, (_, hour) => {
        const hourData = ordersByHour.find(item => item._id === hour);
        return {
          hour: hour.toString().padStart(2, '0') + ':00',
          orders: hourData?.count || 0,
          revenue: hourData?.revenue || 0
        };
      }),
      topRestaurants: topRestaurants.map(item => ({
        id: item._id,
        name: item.restaurant.name,
        orders: item.orderCount,
        revenue: item.revenue
      })),
      orderTrends: orderTrends.map(item => ({
        date: item._id,
        orders: item.orders,
        revenue: item.revenue
      })),
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customer: order.userId?.name || 'Guest',
        restaurant: order.restaurantId?.name || 'Unknown',
        amount: order.total_amount,
        status: order.status,
        time: order.createdAt,
        paymentStatus: order.payment_status
      }))
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message
    });
  }
});

// Get restaurant-specific analytics
router.get("/restaurant/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments({
        restaurantId: id,
        createdAt: { $gte: start, $lte: end }
      }),
      
      Order.aggregate([
        { $match: { 
          restaurantId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: start, $lte: end },
          payment_status: "paid"
        }},
        { $group: { _id: null, total: { $sum: "$total_amount" } }}
      ]),
      
      Order.aggregate([
        { $match: { 
          restaurantId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: start, $lte: end }
        }},
        { $group: { _id: "$status", count: { $sum: 1 } }}
      ]),
      
      Order.find({
        restaurantId: id,
        createdAt: { $gte: start, $lte: end }
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Restaurant analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant analytics",
      error: error.message
    });
  }
});

export default router;