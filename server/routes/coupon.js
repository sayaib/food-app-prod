import express from 'express';
import Coupon from '../models/Coupon.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Admin Routes - Create, Read, Update, Delete Coupons

// GET /api/coupons/admin - Get all coupons for admin
router.get('/admin', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.$or = [
        { isActive: false },
        { expiryDate: { $lt: new Date() } }
      ];
    }

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .populate('applicableCategories', 'name')
      .populate('applicableRestaurants', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.json({
      coupons,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/coupons/admin - Create new coupon
router.post('/admin', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      userUsageLimit,
      applicableCategories,
      applicableRestaurants
    } = req.body;

    // Validate required fields
    if (!code || !title || !description || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return res.status(400).json({ message: 'Fixed discount must be greater than 0' });
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount: maximumDiscountAmount || null,
      startDate: startDate || new Date(),
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit || null,
      userUsageLimit: userUsageLimit || 1,
      applicableCategories: applicableCategories || [],
      applicableRestaurants: applicableRestaurants || [],
      createdBy: req.user.id
    });

    await coupon.save();

    // Populate references before sending response
    await coupon.populate('createdBy', 'name email');
    await coupon.populate('applicableCategories', 'name');
    await coupon.populate('applicableRestaurants', 'name');

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/coupons/admin/:id - Update coupon
router.put('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid coupon ID' });
    }

    // Check if coupon exists
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // If updating code, check for duplicates
    if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Validate discount value if being updated
    if (updateData.discountType && updateData.discountValue) {
      if (updateData.discountType === 'percentage' && (updateData.discountValue <= 0 || updateData.discountValue > 100)) {
        return res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
      }
      if (updateData.discountType === 'fixed' && updateData.discountValue <= 0) {
        return res.status(400).json({ message: 'Fixed discount must be greater than 0' });
      }
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('applicableCategories', 'name')
    .populate('applicableRestaurants', 'name');

    res.json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/coupons/admin/:id - Delete coupon
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid coupon ID' });
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public Routes - No authentication required

// GET /api/coupons/public - Get public offers for explore foods section (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { orderAmount = 0 } = req.query;
    const now = new Date();

    // Find all active and valid coupons for public display
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })
    .populate('applicableCategories', 'name')
    .populate('applicableRestaurants', 'name')
    .sort({ discountValue: -1 }) // Sort by discount value descending
    .limit(10); // Limit to 10 offers for public display

    // Format coupons for public display (no user-specific filtering)
    const publicOffers = coupons.map(coupon => {
      const discount = coupon.calculateDiscount(parseFloat(orderAmount));
      return {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        expiryDate: coupon.expiryDate,
        applicableCategories: coupon.applicableCategories,
        applicableRestaurants: coupon.applicableRestaurants,
        calculatedDiscount: discount,
        isApplicable: parseFloat(orderAmount) >= coupon.minimumOrderAmount
      };
    });

    res.json({ coupons: publicOffers });
  } catch (error) {
    console.error('Error fetching public offers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Routes - Get available coupons, validate, apply

// GET /api/coupons/available - Get available coupons for user
router.get('/available', auth, async (req, res) => {
  try {
    const { orderAmount = 0 } = req.query;
    const userId = req.user.id;
    const now = new Date();

    // Find all active and valid coupons
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })
    .populate('applicableCategories', 'name')
    .populate('applicableRestaurants', 'name')
    .sort({ discountValue: -1 }); // Sort by discount value descending

    // Filter coupons that user can use
    const availableCoupons = coupons.filter(coupon => {
      return coupon.canUserUseCoupon(userId);
    }).map(coupon => {
      const discount = coupon.calculateDiscount(parseFloat(orderAmount));
      return {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        expiryDate: coupon.expiryDate,
        applicableCategories: coupon.applicableCategories,
        applicableRestaurants: coupon.applicableRestaurants,
        calculatedDiscount: discount,
        isApplicable: parseFloat(orderAmount) >= coupon.minimumOrderAmount
      };
    });

    res.json({ coupons: availableCoupons });
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/coupons/validate - Validate coupon code
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user.id;

    if (!code || !orderAmount) {
      return res.status(400).json({ message: 'Coupon code and order amount are required' });
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is valid
    if (!coupon.isValid) {
      return res.status(400).json({ message: 'Coupon is expired or inactive' });
    }

    // Check if user can use this coupon
    if (!coupon.canUserUseCoupon(userId)) {
      return res.status(400).json({ message: 'You have already used this coupon maximum times' });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon` 
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);

    res.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount
      },
      discountAmount,
      finalAmount: orderAmount - discountAmount
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/coupons/apply - Apply coupon to order
router.post('/apply', auth, async (req, res) => {
  try {
    const { couponId, orderAmount } = req.body;
    const userId = req.user.id;

    if (!couponId || !orderAmount) {
      return res.status(400).json({ message: 'Coupon ID and order amount are required' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({ message: 'Invalid coupon ID' });
    }

    // Find coupon
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Validate coupon
    if (!coupon.isValid) {
      return res.status(400).json({ message: 'Coupon is expired or inactive' });
    }

    if (!coupon.canUserUseCoupon(userId)) {
      return res.status(400).json({ message: 'You have already used this coupon maximum times' });
    }

    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon` 
      });
    }

    // Apply coupon
    const discountAmount = coupon.applyCoupon(userId, orderAmount);
    await coupon.save();

    res.json({
      message: 'Coupon applied successfully',
      discountAmount,
      finalAmount: orderAmount - discountAmount,
      coupon: {
        code: coupon.code,
        title: coupon.title
      }
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/coupons/stats - Get coupon usage statistics (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true, 
      expiryDate: { $gte: new Date() } 
    });
    const expiredCoupons = await Coupon.countDocuments({ 
      expiryDate: { $lt: new Date() } 
    });
    
    // Get most used coupons
    const mostUsedCoupons = await Coupon.find()
      .sort({ usedCount: -1 })
      .limit(5)
      .select('code title usedCount discountType discountValue');

    // Calculate total discount given
    const totalDiscountGiven = await Coupon.aggregate([
      { $unwind: '$usedBy' },
      { $group: { _id: null, totalDiscount: { $sum: '$usedBy.discountApplied' } } }
    ]);

    res.json({
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      inactiveCoupons: totalCoupons - activeCoupons - expiredCoupons,
      mostUsedCoupons,
      totalDiscountGiven: totalDiscountGiven[0]?.totalDiscount || 0
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;