// models/Country.js
import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // allows null values while maintaining uniqueness
  },
}, {
  timestamps: true,
});

export default mongoose.model("Country", countrySchema);