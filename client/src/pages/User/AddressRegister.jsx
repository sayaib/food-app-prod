import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuth } from "../../contexts/AuthContext";

mapboxgl.accessToken = "key"; // Replace with your token

const AddressRegister = () => {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [coords, setCoords] = useState({ lng: 77.5946, lat: 12.9716 });
  const [fullAddress, setFullAddress] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);

  // =================== INIT MAP ===================
  useEffect(() => {
    if (!mapRef.current) return; // 💥 Prevent running if DOM not ready

    const mapInstance = new mapboxgl.Map({
      container: mapRef.current, // ✅ Safe now
      style: "mapbox://styles/mapbox/streets-v11",
      center: [coords.lng, coords.lat],
      zoom: 12,
    });

    const newMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapInstance);

    newMarker.on("dragend", () => {
      const { lng, lat } = newMarker.getLngLat();
      setCoords({ lng, lat });
      reverseGeocode(lng, lat);
    });

    setMap(mapInstance);
    setMarker(newMarker);
    reverseGeocode(coords.lng, coords.lat);

    return () => mapInstance.remove();
  }, [mapRef.current]); // 🚫 Problem here

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

  // =================== HELPER FUNCTIONS ===================
  const moveMarker = (lng, lat) => {
    if (marker) marker.setLngLat([lng, lat]);
    if (map) map.flyTo({ center: [lng, lat], zoom: 14 });
  };

  const reverseGeocode = async (lng, lat) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const place = data.features?.[0]?.place_name || "";
      setFullAddress(place);

      data.features.forEach((f) => {
        if (f.place_type.includes("region"))
          setForm((prev) => ({ ...prev, state: f.text }));
        if (f.place_type.includes("country"))
          setForm((prev) => ({ ...prev, country: f.text }));
      });
    } catch (err) {
      console.error("Reverse geocoding error", err);
    }
  };

  const forwardGeocode = async () => {
    const query = `${form.addressLine}, ${form.city}, ${form.pincode}`;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const feature = data.features[0];
      if (feature) {
        const [lng, lat] = feature.geometry.coordinates;
        setCoords({ lng, lat });
        moveMarker(lng, lat);
        setFullAddress(feature.place_name);
      } else alert("Location not found.");
    } catch (err) {
      console.error("Forward geocode error", err);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lng: longitude, lat: latitude });
        moveMarker(longitude, latitude);
        reverseGeocode(longitude, latitude);
      },
      () => alert("Location permission denied.")
    );
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!fullAddress) return alert("Select a valid address.");
    const payload = {
      ...form,
      addressLine: form.addressLine || fullAddress,
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
        {
          method: "PUT",
        }
      );
      if (res.ok) {
        fetchAddresses();
        alert("Default address updated!");
      }
    } catch (err) {
      console.error("Set default error", err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search) return setSuggestions([]);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          search
        )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSuggestionClick = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    moveMarker(lng, lat);
    setCoords({ lng, lat });
    setFullAddress(feature.place_name);
    setSearch(feature.place_name);
    setSuggestions([]);
  };

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

            {/* Search */}
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="Search address..."
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border rounded mt-1 shadow max-h-60 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Location Button */}
            <button
              onClick={getCurrentLocation}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              📍 Use Current Location
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

            {/* Locate Button */}
            <button
              onClick={forwardGeocode}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              📌 Locate on Map
            </button>

            {/* Map */}
            <div
              ref={mapRef}
              className="w-full h-80 border rounded-lg shadow"
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
