import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0,
    default: null // null means no maximum limit
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    min: 1,
    default: null // null means unlimited usage
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsageLimit: {
    type: Number,
    min: 1,
    default: 1 // How many times a single user can use this coupon
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCategory'
  }],
  applicableRestaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderAmount: {
      type: Number,
      required: true
    },
    discountApplied: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponSchema.index({ startDate: 1, expiryDate: 1 });

// Virtual to check if coupon is currently valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.expiryDate >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
  if (!this.isValid) return false;
  
  const userUsages = this.usedBy.filter(usage => 
    usage.user.toString() === userId.toString()
  );
  
  return userUsages.length < this.userUsageLimit;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minimumOrderAmount) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    
    // Apply maximum discount limit if set
    if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
      discount = this.maximumDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
    
    // Fixed discount cannot exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon usage
couponSchema.methods.applyCoupon = function(userId, orderAmount) {
  const discountAmount = this.calculateDiscount(orderAmount);
  
  this.usedBy.push({
    user: userId,
    orderAmount: orderAmount,
    discountApplied: discountAmount
  });
  
  this.usedCount += 1;
  
  return discountAmount;
};

// Pre-save middleware to ensure expiry date is after start date
couponSchema.pre('save', function(next) {
  if (this.expiryDate <= this.startDate) {
    next(new Error('Expiry date must be after start date'));
  } else {
    next();
  }
});

export default mongoose.model('Coupon', couponSchema);