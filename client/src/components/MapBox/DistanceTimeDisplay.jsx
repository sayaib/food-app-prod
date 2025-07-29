import React, { useEffect, useState } from "react";
import { MAPBOX_PA } from "../../services/api";

const DistanceTimeDisplay = ({ origin, destination }) => {
  const [distance, setDistance] = useState(null); // in km
  const [duration, setDuration] = useState(null); // in minutes
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRouteData = async () => {
      if (!origin || !destination) return;

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_PA}&geometries=geojson`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const route = data.routes[0];

        if (route) {
          setDistance((route.distance / 1000).toFixed(2)); // meters to km
          setDuration((route.duration / 60).toFixed(2)); // seconds to minutes
        }
      } catch (err) {
        setError("Failed to fetch route info");
        console.error(err);
      }
    };

    fetchRouteData();
  }, [origin, destination]);

  if (error) return <p>{error}</p>;
  if (!distance || !duration) return <p>Loading...</p>;

  return (
    <div>
      <p>
        <strong>Distance:</strong> {distance} km
      </p>
      <p>
        <strong>Estimated Time:</strong> {duration} mins
      </p>
    </div>
  );
};

export default DistanceTimeDisplay;
