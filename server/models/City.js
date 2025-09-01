// models/City.js
import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  coordinates: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique city names within the same country
citySchema.index({ name: 1, country: 1 }, { unique: true });

export default mongoose.model("City", citySchema);