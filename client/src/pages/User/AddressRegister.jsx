import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuth } from "../../contexts/AuthContext";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2F5YWlib3NsIiwiYSI6ImNtZGlycGU2cTBkdGQya3NkN2JjYng3dGwifQ.FNgp4LLGPFZ7KzvV6mCjaw"; // 🔐 Replace with your actual token

const AddressRegister = () => {
  const { user } = useAuth();

  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  const [coords, setCoords] = useState({ lng: 77.5946, lat: 12.9716 });
  const [zoom] = useState(12);
  const [form, setForm] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    isDefault: true,
  });
  const [fullAddress, setFullAddress] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const init = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [coords.lng, coords.lat],
      zoom,
    });

    const newMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([coords.lng, coords.lat])
      .addTo(init);

    newMarker.on("dragend", () => {
      const { lng, lat } = newMarker.getLngLat();
      setCoords({ lng, lat });
      reverseGeocode(lng, lat);
    });

    setMap(init);
    setMarker(newMarker);
    reverseGeocode(coords.lng, coords.lat);

    return () => init.remove();
  }, []);

  const moveMarker = (lng, lat) => {
    marker?.setLngLat([lng, lat]) ??
      setMarker(new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map));
    map.flyTo({ center: [lng, lat], zoom: 14 });
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
      console.error("Reverse geocoding error:", err);
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
        setFullAddress(feature.place_name);
        moveMarker(lng, lat);
      } else alert("Location not found. Try again.");
    } catch (err) {
      console.error("Forward geocode error:", err);
    }
  };

  const handleSuggestionClick = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    setSearchInput(feature.place_name);
    setSuggestions([]);
    setCoords({ lng, lat });
    moveMarker(lng, lat);
    setFullAddress(feature.place_name);
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!searchInput) return setSuggestions([]);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput
        )}.json?access_token=${
          mapboxgl.accessToken
        }&autocomplete=true&limit=5&proximity=${coords.lng},${coords.lat}`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        moveMarker(longitude, latitude);
        reverseGeocode(longitude, latitude);
      },
      () => alert("Location permission denied.")
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!fullAddress) return alert("Please select a valid location.");
    const payload = {
      ...form,
      id: user.id,
      addressLine: form.addressLine || fullAddress,
      location: { type: "Point", coordinates: [coords.lng, coords.lat] },
    };
    try {
      const res = await fetch("/api/map/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      res.ok
        ? alert("Address saved successfully!")
        : alert(data.message || "Failed to save address");
    } catch (err) {
      console.error("Save failed", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
            placeholder="Search for an address..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 bg-white border border-gray-300 mt-1 w-full rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((item, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={getCurrentLocation}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          📍 Locate Me
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            Label
            <select
              name="label"
              value={form.label}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </label>
          <label className="flex flex-col">
            Address Line
            <input
              name="addressLine"
              value={form.addressLine}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg"
            />
          </label>
          <label className="flex flex-col">
            City
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg"
            />
          </label>
          <label className="flex flex-col">
            Pincode
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg"
            />
          </label>
        </div>
        <button
          onClick={forwardGeocode}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          📌 Locate on Map
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-96 rounded-xl border shadow-lg"
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
        <p className="text-sm text-gray-700">
          <strong>📍 Selected Address:</strong>{" "}
          {fullAddress || "Drag the marker or search to select an address"}
        </p>
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          💾 Save Address
        </button>
      </div>
    </div>
  );
};

export default AddressRegister;
