import express from "express";
import MenuItem from "../models/MenuItem.js";
import { getFileBucketMenuImage } from "../config/imageBucket.js";
import multer from "multer";
import mongoose from "mongoose";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// Create a menu item
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, type, restaurantId } = req.body;
    const gfs = await getFileBucketMenuImage();

    let imageId = null;

    if (req.file) {
      const stream = gfs.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

      await new Promise((resolve, reject) => {
        stream.on("finish", () => {
          imageId = stream.id;
          resolve();
        });
        stream.on("error", reject);
        stream.end(req.file.buffer);
      });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      type,
      restaurantId,
      image: imageId,
    });

    await menuItem.save();

    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error("Menu item upload failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

router.delete("/delete/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, msg: "Menu item not found" });
    }

    const gfs = await getFileBucketMenuImage();
    console.log(menuItem.image);
    // Delete image from GridFS if it exists
    if (menuItem.image) {
      try {
        const fileId = new mongoose.Types.ObjectId(menuItem.image);
        await gfs.delete(fileId);
      } catch (err) {
        console.error("Failed to delete image from GridFS:", err.message);
      }
    }
    // Delete the menu item itself
    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "Menu item and image deleted successfully",
    });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

export default router;
