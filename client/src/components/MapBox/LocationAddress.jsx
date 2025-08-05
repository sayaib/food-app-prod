import React, { useEffect, useState } from "react";
import { MAPBOX_PA } from "../../services/api";

const LocationAddress = ({ lat, lng, accuracy }) => {
  const [address, setAddress] = useState("Fetching address...");

  useEffect(() => {
    const getAddressFromCoordinates = async () => {
      if (!lat || !lng) {
        setAddress("Location not available");
        return;
      }
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_PA}`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setAddress(
            `${data.features[0].place_name} (±${Math.round(accuracy)} m)`
          );
        } else {
          setAddress("Address not found");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setAddress("Error fetching address");
      }
    };

    getAddressFromCoordinates();
  }, [lat, lng, accuracy]);

  return <span>{address}</span>;
};

export default LocationAddress;
