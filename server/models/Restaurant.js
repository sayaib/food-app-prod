// models/Restaurant.js
import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  cuisine_types: String,
  menu_images: [{ type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" }],
  logo_images: [{ type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" }],
  theme_images: [
    { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
  ],

  documents: {
    fssai: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
    gst: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
  },
  status: {
    type: String,
    enum: ["pending", "active", "suspended", "rejected"],
    default: "pending",
  },

  commission_percentage: {
    type: Number,
    default: 15,
  },

  rating: {
    type: Number,
    default: 0,
  },

  total_orders: {
    type: Number,
    default: 0,
  },
  menu: [],
  bank_details: {
    account_holder: { type: String },
    account_number: { type: String },
    ifsc: { type: String },
  },
  registration_date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Restaurant", RestaurantSchema);
