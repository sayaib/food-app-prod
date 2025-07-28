/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_PA } from "../../services/api";

const MapboxAddressPicker = ({
  initialCoords = { lng: 77.5946, lat: 12.9716 },
  onAddressSelect,
  showControls = true,
}) => {
  mapboxgl.accessToken = MAPBOX_PA; // Replace with your token

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [coords, setCoords] = useState(initialCoords);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // INIT MAP
  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [coords.lng, coords.lat],
      zoom: 12,
    });

    const newMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapInstance);

    newMarker.on("dragend", () => {
      const { lng, lat } = newMarker.getLngLat();
      handleCoordsChange(lng, lat);
    });

    setMap(mapInstance);
    setMarker(newMarker);
    handleCoordsChange(coords.lng, coords.lat);

    return () => mapInstance.remove();
  }, [mapRef.current]);

  const handleCoordsChange = async (lng, lat) => {
    setCoords({ lng, lat });

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const place = data.features?.[0]?.place_name || "";
      const extra = {};
      data.features.forEach((f) => {
        if (f.place_type.includes("region")) extra.state = f.text;
        if (f.place_type.includes("country")) extra.country = f.text;
      });

      onAddressSelect?.(lng, lat, place, extra);
    } catch (err) {
      console.error("Reverse geocoding error", err);
    }
  };

  const forwardGeocode = async (query) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature) {
        const [lng, lat] = feature.geometry.coordinates;
        if (map) map.flyTo({ center: [lng, lat], zoom: 14 });
        if (marker) marker.setLngLat([lng, lat]);
        handleCoordsChange(lng, lat);
      }
    } catch (err) {
      console.error("Forward geocode error", err);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (map) map.flyTo({ center: [longitude, latitude], zoom: 14 });
        if (marker) marker.setLngLat([longitude, latitude]);
        handleCoordsChange(longitude, latitude);
      },
      () => alert("Location permission denied.")
    );
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
    if (map) map.flyTo({ center: [lng, lat], zoom: 14 });
    if (marker) marker.setLngLat([lng, lat]);
    handleCoordsChange(lng, lat);
    setSearch(feature.place_name);
    setSuggestions([]);
  };

  return (
    <div className="space-y-4">
      {showControls && (
        <>
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

          <button
            onClick={getCurrentLocation}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📍 Use Current Location
          </button>
          {/* <button
            onClick={forwardGeocode}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📍 convert
          </button> */}
        </>
      )}
      <div ref={mapRef} className="w-full h-80 border rounded-lg shadow" />
    </div>
  );
};

export default MapboxAddressPicker;
