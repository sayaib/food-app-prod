import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Replace with your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2F5YWlib3NsIiwiYSI6ImNtZG12bTgwdDFrdzkya3NmamoycXRteXQifQ.DZE5B9Hx6dXtGVGPUMYnYA";

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
