import express from "express";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

// Create a menu item
router.post("/create", async (req, res) => {
  try {
    console.log(req.body);
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get menu by restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Update Menu Item
router.put("/update/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Delete Menu Item
router.delete("/delete/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

export default router;
