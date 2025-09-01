// utils/getDistanceAndDuration.js
import fetch from "node-fetch";

// Lazy load Mapbox access token to ensure environment variables are loaded
function getMapboxToken() {
  const token = process.env.MAPBOX_PA;
  if (!token) {
    throw new Error('MAPBOX_PA environment variable is not set');
  }
  return token;
}

/**
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {Promise<{ distance: number, duration: number }>}
 */
export default async function getDistanceAndDuration(origin, destination) {
  // console.log("Origin:", origin, "Destination:", destination);

  if (!origin || !destination) {
    throw new Error("Origin and destination are required.");
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${getMapboxToken()}&geometries=geojson&overview=full&steps=true&radiuses=unlimited;unlimited`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Debug Mapbox response
    if (!response.ok) {
      console.error("Mapbox error response:", data);
      throw new Error(
        `Mapbox API Error ${response.status}: ${
          data.message || "Unknown error"
        }`
      );
    }

    const route = data.routes?.[0];

    if (!route) {
      console.error("No route found. Mapbox said:", data.message || data);
      throw new Error("No route found from Mapbox");
    }

    return {
      distance: +(route.distance / 1000).toFixed(2), // km
      duration: +(route.duration / 60).toFixed(2), // minutes
    };
  } catch (err) {
    console.error("Mapbox API call failed:", err.message);
    throw err;
  }
}
