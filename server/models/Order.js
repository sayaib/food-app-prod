import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    customerID: { type: String, required: true, unique: true },
    customer_email: { type: String, required: true },
    total_amount: { type: Number, required: true },
    payment_status: { type: String, required: true },
    items: [
      {
        name: String,
        quantity: Number,
        amount: Number,
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },

    phone: { type: String, unique: true, sparse: true },
    userFullAddress: String,
    userLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    restaurantFullAddress: String,
    restaurantLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    deliveryLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "failed",
        "refunded",
      ],
      default: "placed",
    },
    statusUpdatedAt: { type: Date, default: Date.now },
    estimatedDeliveryTime: { type: Number }, // in minutes
    estimatedDistance: { type: Number }, // in kilometers
    promoCode: String, // Legacy field - kept for backward compatibility
    appliedCoupon: {
      code: String,
      discountAmount: Number,
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveredOTP: {
      type: Number,
    },
    isOtpVerified: {
      type: Boolean,
      default: false, // initially false
    },
    // Order breakdown for invoice and analytics
    orderBreakdown: {
      type: Object,
    },
    // Delivery instructions from customer
    deliveryInstructions: {
      type: String,
      default: "",
      maxlength: 500,
    },
    // Rating submitted by customer after delivery
    rating: {
      restaurant: {
        type: Number,
        min: 1,
        max: 5,
      },
      delivery: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        default: "",
        maxlength: 500,
      },
      submittedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

orderSchema.index({ location: "2dsphere" });

export default mongoose.model("Order", orderSchema);
