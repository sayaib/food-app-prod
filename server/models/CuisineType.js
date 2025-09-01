// models/CuisineType.js
import mongoose from "mongoose";

const cuisineTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  origin: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model("CuisineType", cuisineTypeSchema);