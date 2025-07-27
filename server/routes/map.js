import express from "express";
import {
  addUserAddress,
  getUserAddresses,
  setDefaultAddress,
} from "../controller/mapController.js";

const router = express.Router();

router.post("/address", addUserAddress);
router.get("/address", getUserAddresses);
router.put("/address/:addressId/default", setDefaultAddress);

export default router;
