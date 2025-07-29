import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MapboxAddressPicker from "../../components/MapBox/MapboxAddressPicker";

const AddressRegister = () => {
  const { user } = useAuth();
  const [coords, setCoords] = useState({ lng: 77.5946, lat: 12.9716 });
  const [fullAddress, setFullAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);

  const [form, setForm] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
  });

  // =================== FETCH ADDRESSES ===================
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`/api/map/getAddress/${user.id}`);
      const data = await res.json();
      if (res.ok) setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAddresses();
  }, [user]);

  // =================== HANDLERS ===================
  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!fullAddress) return alert("Select a valid address.");
    const payload = {
      ...form,
      fullAddress: fullAddress,
      addressLine: form.addressLine || "",
      id: user.id,
      isDefault: addresses.length === 0,
      location: {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      },
    };
    try {
      const res = await fetch("/api/map/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        fetchAddresses();
        setPopupVisible(false);
        alert("Address saved!");
      } else alert(data.message || "Save failed.");
    } catch (err) {
      console.error("Save error", err);
      alert("Save failed.");
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/map/address/${user.id}/${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAddresses();
        alert("Deleted!");
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch(
        `/api/map/address/${user.id}/${addressId}/default`,
        { method: "PUT" }
      );
      if (res.ok) {
        fetchAddresses();
        alert("Default address updated!");
      }
    } catch (err) {
      console.error("Set default error", err);
    }
  };
  console.log(fullAddress);
  // =================== JSX ===================
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-4">📍 Your Addresses</h2>
        {addresses.length ? (
          <ul className="space-y-4">
            {addresses.map((addr) => (
              <li
                key={addr._id}
                className="p-4 rounded-lg border bg-gray-50 flex flex-col sm:flex-row justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {addr.label}
                    {addr.isDefault && (
                      <span className="ml-2 text-sm text-blue-600">
                        ⭐ Default
                      </span>
                    )}
                  </p>

                  <p className="text-sm">{addr.addressLine}</p>
                  <p className="text-sm">{addr.fullAddress}</p>

                  <p className="text-xs text-gray-500">
                    {addr.city}, {addr.pincode}, {addr.state}, {addr.country}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      ⭐ Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No addresses saved yet.</p>
        )}
        <button
          onClick={() => setPopupVisible(true)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          ➕ Add Address
        </button>
      </div>

      {/* Address Popup */}
      {popupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full space-y-6 relative">
            <button
              onClick={() => setPopupVisible(false)}
              className="absolute top-2 right-3 text-xl text-gray-500 hover:text-black"
            >
              ✖
            </button>

            {/* Address Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="label"
                value={form.label}
                onChange={handleInput}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="Home">🏠 Home</option>
                <option value="Work">🏢 Work</option>
                <option value="Other">📦 Other</option>
              </select>
              <input
                name="addressLine"
                placeholder="Address Line"
                value={form.addressLine}
                onChange={handleInput}
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleInput}
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleInput}
                className="border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Mapbox Picker */}
            <MapboxAddressPicker
              initialCoords={coords}
              onAddressSelect={(lng, lat, place_name, extra) => {
                setCoords({ lng, lat });
                setFullAddress(place_name);
                setForm((prev) => ({
                  ...prev,
                  addressLine: prev.addressLine || place_name,
                  state: extra.state || prev.state,
                  country: extra.country || prev.country,
                }));
              }}
            />

            {/* Save */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                <strong>📍 Address:</strong> {fullAddress || "Not selected"}
              </p>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressRegister;
