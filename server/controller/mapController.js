import User from "../models/User.js";

// POST /api/user/address
export const addUserAddress = async (req, res) => {
  try {
    const userId = req.body.id;
    const {
      label,
      addressLine,
      city,
      state,
      country,
      pincode,
      location, // { type: "Point", coordinates: [lng, lat] }
      isDefault = false,
    } = req.body;
    console.log(req.body);
    if (!addressLine || !location || !Array.isArray(location.coordinates)) {
      return res
        .status(400)
        .json({ message: "Invalid address or coordinates" });
    }

    const user = await User.findById(userId);

    // If this is the first address, set as default
    const setDefault = user.addresses.length === 0 ? true : isDefault;

    // Clear existing default if this is marked default
    if (setDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      label,
      addressLine,
      city,
      state,
      country,
      pincode,
      location,
      isDefault: setDefault,
    });

    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/user/address
export const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

// PUT /api/user/address/:addressId/default
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    res.json({ message: "Default address set", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to set default address" });
  }
};
