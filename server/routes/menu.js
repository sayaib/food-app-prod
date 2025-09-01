import express from "express";
import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";
import FoodCategory from "../models/FoodCategory.js";
import Country from "../models/Country.js";
import City from "../models/City.js";
import CuisineType from "../models/CuisineType.js";
import { getFileBucketMenuImage } from "../config/imageBucket.js";
import multer from "multer";
import mongoose from "mongoose";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// Create a menu item
router.post(
  "/create",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log(req.user);
      const { name, description, price, category, type, restaurantId, userId } =
        req.body;
      const gfs = await getFileBucketMenuImage();

      let imageId = null;

      if (req.file) {
        const stream = gfs.openUploadStream(req.file.originalname, {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user._id, // ✅ Include user ID in file metadata
            fieldName: name, // optional: to track which file type it is
          },
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

      // Create the menu item
      const menuItem = new MenuItem({
        name,
        description,
        price,
        category,
        type,
        restaurantId,
        userId,
        image: imageId,
      });

      await menuItem.save();

      // Add the menuItem's _id to the restaurant's menu array
      await Restaurant.findByIdAndUpdate(
        restaurantId,
        { $push: { menu: menuItem._id } },
        { new: true }
      );

      res.json({ success: true, data: menuItem });
    } catch (error) {
      console.error("Menu item upload failed:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Get menu by restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    // Step 1: Find the restaurant
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // Step 2: Get menu items that match the IDs in restaurant.menu
    const menuItems = await MenuItem.find({
      _id: { $in: restaurant.menu },
    });

    // Step 3: Send them as the response
    res.json({ success: true, data: menuItems });
  } catch (err) {
    console.error("Error fetching menu items by ID:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update Menu Item
router.put("/update/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, type } = req.body;
    const gfs = await getFileBucketMenuImage();
    
    // Find the existing menu item
    const existingItem = await MenuItem.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    let imageId = existingItem.image; // Keep existing image by default

    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists
      if (existingItem.image) {
        try {
          const oldFileId = new mongoose.Types.ObjectId(existingItem.image);
          const found = await gfs.find({ _id: oldFileId }).toArray();
          if (found.length) {
            await gfs.delete(oldFileId);
            console.log(`Deleted old image file: ${oldFileId}`);
          }
        } catch (err) {
          console.error("Failed to delete old image:", err.message);
        }
      }

      // Upload new image
      const stream = gfs.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: {
          uploadedBy: req.user._id,
          fieldName: name,
        },
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

    // Update the menu item
    const updateData = {
      name,
      description,
      price,
      category,
      type,
      image: imageId,
    };

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    
    res.json({ success: true, data: item });
  } catch (err) {
    console.error("Menu item update failed:", err);
    res.status(500).json({ success: false, message: err.message });
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

    // Delete image from GridFS if it exists
    if (menuItem.image) {
      try {
        const fileId = new mongoose.Types.ObjectId(menuItem.image);
        // await gfs.delete(fileId);
        const found = await gfs.find({ _id: fileId }).toArray();

        if (found.length) {
          await gfs.delete(fileId);
          console.log(`Deleted file and chunks for ID: ${fileId}`);
        } else {
          console.warn("File not found in GridFS");
        }
      } catch (err) {
        console.error("Failed to delete image from GridFS:", err.message);
      }
    }

    // Remove the menu item's ID from the restaurant's menu array
    await Restaurant.findByIdAndUpdate(menuItem.restaurantId, {
      $pull: { menu: menuItem._id },
    });

    // Delete the menu item itself
    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "Menu item, image, and reference removed successfully",
    });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Add Category
router.post("/add-category", async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new FoodCategory({ name });
    await newCategory.save();
    res
      .status(201)
      .json({ success: true, msg: "Category added", data: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Get All Categories
router.get("/get-category", async (req, res) => {
  const categories = await FoodCategory.find({});
  res.json({ success: true, data: categories });
});

// Delete Category
router.delete("/delete-category/:id", async (req, res) => {
  try {
    await FoodCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Category deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ==================== COUNTRY ROUTES ====================

// Add Country
router.post("/add-country", async (req, res) => {
  try {
    const { name, code } = req.body;
    const newCountry = new Country({ name, code });
    await newCountry.save();
    res
      .status(201)
      .json({ success: true, msg: "Country added", data: newCountry });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, msg: "Country already exists" });
    } else {
      res.status(500).json({ success: false, msg: err.message });
    }
  }
});

// Get All Countries
router.get("/get-countries", async (req, res) => {
  try {
    const countries = await Country.find({}).sort({ name: 1 });
    res.json({ success: true, data: countries });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Delete Country
router.delete("/delete-country/:id", async (req, res) => {
  try {
    await Country.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Country deleted" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// ==================== CITY ROUTES ====================

// Add City
router.post("/add-city", async (req, res) => {
  try {
    const { name, country, state, coordinates } = req.body;
    const newCity = new City({ name, country, state, coordinates });
    await newCity.save();
    res
      .status(201)
      .json({ success: true, msg: "City added", data: newCity });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, msg: "City already exists in this country" });
    } else {
      res.status(500).json({ success: false, msg: err.message });
    }
  }
});

// Get All Cities
router.get("/get-cities", async (req, res) => {
  try {
    const cities = await City.find({}).populate('country', 'name').sort({ name: 1 });
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Get Cities by Country
router.get("/get-cities/:countryId", async (req, res) => {
  try {
    const cities = await City.find({ country: req.params.countryId }).sort({ name: 1 });
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Delete City
router.delete("/delete-city/:id", async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "City deleted" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// ==================== CUISINE TYPE ROUTES ====================

// Add Cuisine Type
router.post("/add-cuisine", async (req, res) => {
  try {
    const { name, description, origin } = req.body;
    const newCuisine = new CuisineType({ name, description, origin });
    await newCuisine.save();
    res
      .status(201)
      .json({ success: true, msg: "Cuisine type added", data: newCuisine });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, msg: "Cuisine type already exists" });
    } else {
      res.status(500).json({ success: false, msg: err.message });
    }
  }
});

// Get All Cuisine Types
router.get("/get-cuisines", async (req, res) => {
  try {
    const cuisines = await CuisineType.find({}).sort({ name: 1 });
    res.json({ success: true, data: cuisines });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Delete Cuisine Type
router.delete("/delete-cuisine/:id", async (req, res) => {
  try {
    await CuisineType.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Cuisine type deleted" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

export default router;
