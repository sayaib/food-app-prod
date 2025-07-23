// routes/restaurant.js
import express from "express";
import multer from "multer";
import { getFileBucket } from "../config/gridfs.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js"; // Make sure this is imported
import authMiddleware from "../middleware/auth.js"; // Assuming you have an auth middleware

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  authMiddleware, // ✅ Protect this route to get req.user
  upload.fields([{ name: "menu_images" }, { name: "fssai" }, { name: "gst" }]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        "address.line1": line1,
        "address.city": city,
        "address.state": state,
        "address.pincode": pincode,
        cuisine_types,
      } = req.body;

      const gfs = await getFileBucket();

      const uploadToGridFS = (file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = gfs.openUploadStream(file.originalname, {
            contentType: file.mimetype,
          });
          uploadStream.end(file.buffer);
          uploadStream.on("finish", () => resolve(uploadStream.id));
          uploadStream.on("error", reject);
        });
      };

      const menuImageIds = await Promise.all(
        (req.files["menu_images"] || []).map(uploadToGridFS)
      );

      const fssaiId = req.files["fssai"]?.[0]
        ? await uploadToGridFS(req.files["fssai"][0])
        : null;

      const gstId = req.files["gst"]?.[0]
        ? await uploadToGridFS(req.files["gst"][0])
        : null;

      // Create restaurant document
      const restaurant = new Restaurant({
        name,
        email,
        phone,
        address: { line1, city, state, pincode },
        cuisine_types,
        menu_images: menuImageIds,
        documents: { fssai: fssaiId, gst: gstId },
      });

      await restaurant.save();

      // ✅ Link restaurant to user
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.restaurant = restaurant._id;
      await user.save();

      res.status(201).json({
        message: "Restaurant registered successfully",
        restaurantId: restaurant._id,
      });
    } catch (err) {
      console.error("Error saving restaurant:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "restaurant",
      "status name"
    );

    if (!user || !user.restaurant) {
      return res.status(404).json({ message: "Restaurant not registered yet" });
    }

    res.json({
      status: user.restaurant.status,
      name: user.restaurant.name,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
