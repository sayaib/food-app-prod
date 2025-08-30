import { useState, useEffect } from 'react';

const useAutoLocation = (autoFetch = true) => {
  const [location, setLocation] = useState({
    latitude: sessionStorage.getItem('user_lat'),
    longitude: sessionStorage.getItem('user_lng'),
    accuracy: sessionStorage.getItem('user_accuracy')
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Update state
          setLocation({ latitude, longitude, accuracy });
          
          // Store in sessionStorage
          sessionStorage.setItem('user_lat', latitude.toString());
          sessionStorage.setItem('user_lng', longitude.toString());
          sessionStorage.setItem('user_accuracy', accuracy.toString());
          
          setIsLoading(false);
          resolve({ latitude, longitude, accuracy });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location.';
              break;
          }
          
          setError(errorMessage);
          setIsLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Auto-fetch location on component mount if enabled and no location exists
  useEffect(() => {
    if (autoFetch && (!location.latitude || !location.longitude)) {
      getCurrentLocation().catch(console.error);
    }
  }, [autoFetch]);

  const refreshLocation = () => {
    return getCurrentLocation();
  };

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    refreshLocation,
    hasLocation: !!(location.latitude && location.longitude)
  };
};

export default useAutoLocation;