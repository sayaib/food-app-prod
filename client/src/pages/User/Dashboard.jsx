import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "key"; // 🔐 Replace with your token

const MapWithDirections = () => {
  const mapRef = useRef(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const destination = [88.3639, 22.5726]; // 🔁 Replace with your selected location (lng, lat)

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: userLocation,
          zoom: 13,
        });

        const directions = new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: "metric",
          profile: "mapbox/driving", // or "walking", "cycling"
        });

        map.addControl(directions, "top-left");

        // Set origin and destination
        directions.setOrigin(userLocation);
        directions.setDestination(destination);

        // Listen for route change
        directions.on("route", (e) => {
          const route = e.route[0];
          setDistance((route.distance / 1000).toFixed(2)); // in KM
          setDuration((route.duration / 60).toFixed(2)); // in minutes
        });

        return () => map.remove();
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to access location");
      }
    );
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ height: "500px" }} />
      {distance && duration && (
        <div className="p-4 bg-white shadow rounded">
          <p>🛣️ Distance: {distance} km</p>
          <p>⏱️ Duration: {duration} mins</p>
        </div>
      )}
    </div>
  );
};

export default MapWithDirections;
