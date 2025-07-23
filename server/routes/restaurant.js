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
  upload.fields([
    { name: "logo_images", maxCount: 1 },
    { name: "theme_images", maxCount: 1 },
    { name: "menu_images", maxCount: 1 },
    { name: "fssai", maxCount: 1 },
    { name: "gst", maxCount: 1 },
  ]),

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
      const themeImageIds = await Promise.all(
        (req.files["theme_images"] || []).map(uploadToGridFS)
      );
      const logoImageIds = await Promise.all(
        (req.files["logo_images"] || []).map(uploadToGridFS)
      );

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
        logo_images: logoImageIds,
        theme_images: themeImageIds,

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
      id: user.restaurant._id,
      status: user.restaurant.status,
      name: user.restaurant.name,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/restaurants?search=abc&page=1&limit=10
router.get("/getRestaurantData", async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const query = search
    ? {
        $or: [
          { status: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query).skip(skip).limit(parseInt(limit)),
    Restaurant.countDocuments(query),
  ]);

  res.json({
    data: restaurants,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/verify", async (req, res) => {
  const { restaurantId, status, remarks } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant)
    return res.status(404).json({ success: false, message: "Not found" });

  restaurant.status = status;
  restaurant.verificationRemarks = remarks;
  await restaurant.save();

  res.json({ success: true, message: "Status updated" });
});

router.get("/data", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
