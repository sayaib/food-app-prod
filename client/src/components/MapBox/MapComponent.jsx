import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_PA } from "../../services/api";

// Replace with your Mapbox access token
mapboxgl.accessToken = MAPBOX_PA;

const MapComponent = ({ lat, lon }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lon, lat], // [lng, lat]
      zoom: 15,
    });

    new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);

    return () => map.remove(); // cleanup
  }, [lat, lon]);

  return (
    <div>
      <div
        ref={mapContainer}
        style={{
          width: "95%",
          margin: "10px auto",
          height: "400px",
          border: "2px solid black",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default MapComponent;
