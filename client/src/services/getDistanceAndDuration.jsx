import { MAPBOX_PA } from "./api";

/**
 * Fetch driving distance and duration between two coordinates using Mapbox API.
 *
 * @param {{ lat: number, lng: number }} origin - Starting point
 * @param {{ lat: number, lng: number }} destination - Ending point
 * @returns {Promise<{ distance: number, duration: number }>} Distance in km, Duration in minutes
 */
const getDistanceAndDuration = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination coordinates are required.");
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_PA}&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const route = data.routes[0];

    if (!route) {
      throw new Error("No route found.");
    }

    return {
      distance: +(route.distance / 1000).toFixed(2), // in km
      duration: +(route.duration / 60).toFixed(2), // in minutes
    };
  } catch (err) {
    console.error("Mapbox Directions API Error:", err.message);
    throw err;
  }
};

export default getDistanceAndDuration;
