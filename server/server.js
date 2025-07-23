import dotenv from "dotenv"; // Load .env once at the entry point
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import restaurantRoutes from "./routes/restaurant.js";
import fileRoutes from "./routes/files.js";
import menuRoutes from "./routes/menu.js";

import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/file", fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
