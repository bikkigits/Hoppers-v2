import { useState, useEffect, useRef } from 'react';
import type L from 'leaflet';
import {
  Coordinates,
  calculateDistanceKm,
  isWithinKolkataBounds,
  clampToKolkata,
  ESPLANADE_CENTER,
} from '../utils/geo';

export type LocationCoords = Coordinates;

/**
 * Custom React hook that manages hardware GPS tracking with strict 50-meter displacement throttling.
 *
 * Performance Objectives:
 * 1. Filter micro-drifts and sub-50m GPS jitter to avoid unnecessary Haversine recalculation cascades.
 * 2. Seamlessly clamp out-of-bounds coordinates to Kolkata bounding box.
 * 3. Gracefully fallback to Leaflet map center or Esplanade hub if GPS is unavailable, timed out, or denied.
 *
 * @param rawCoords Optional pre-existing coordinates or null
 * @param thresholdMeters Minimum displacement in meters required to trigger an update (default: 50)
 * @param mapInstance Optional Leaflet Map instance to query center coordinates when GPS is offline
 * @returns Throttled LocationCoords | null
 */
export function useThrottledLocation(
  rawCoords?: LocationCoords | null,
  thresholdMeters: number = 50,
  mapInstance?: L.Map | null
): LocationCoords | null {
  const [throttledCoords, setThrottledCoords] = useState<LocationCoords | null>(() => {
    if (rawCoords) {
      return isWithinKolkataBounds(rawCoords.lat, rawCoords.lng)
        ? rawCoords
        : clampToKolkata(rawCoords.lat, rawCoords.lng);
    }
    return null;
  });

  const lastEmittedCoordsRef = useRef<LocationCoords | null>(throttledCoords);

  // Synchronize when explicit rawCoords prop changes
  useEffect(() => {
    if (rawCoords === undefined) return;

    if (!rawCoords) {
      if (lastEmittedCoordsRef.current !== null) {
        lastEmittedCoordsRef.current = null;
        setThrottledCoords(null);
      }
      return;
    }

    const validatedCoords = isWithinKolkataBounds(rawCoords.lat, rawCoords.lng)
      ? rawCoords
      : clampToKolkata(rawCoords.lat, rawCoords.lng);

    if (!lastEmittedCoordsRef.current) {
      lastEmittedCoordsRef.current = validatedCoords;
      setThrottledCoords(validatedCoords);
      return;
    }

    const distanceKm = calculateDistanceKm(
      lastEmittedCoordsRef.current.lat,
      lastEmittedCoordsRef.current.lng,
      validatedCoords.lat,
      validatedCoords.lng
    );

    if (distanceKm * 1000 >= thresholdMeters) {
      lastEmittedCoordsRef.current = validatedCoords;
      setThrottledCoords(validatedCoords);
    }
  }, [rawCoords?.lat, rawCoords?.lng, thresholdMeters]);

  // Active hardware GPS watcher with high accuracy and displacement filtering
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    // If explicit rawCoords prop was provided, skip internal geolocation watcher
    if (rawCoords !== undefined && rawCoords !== null) {
      return;
    }

    let isMounted = true;

    const handleSuccess = (position: GeolocationPosition) => {
      if (!isMounted) return;

      const rawLat = position.coords.latitude;
      const rawLng = position.coords.longitude;

      const validCoords = isWithinKolkataBounds(rawLat, rawLng)
        ? { lat: rawLat, lng: rawLng }
        : clampToKolkata(rawLat, rawLng);

      if (!lastEmittedCoordsRef.current) {
        lastEmittedCoordsRef.current = validCoords;
        setThrottledCoords(validCoords);
        return;
      }

      const distKm = calculateDistanceKm(
        lastEmittedCoordsRef.current.lat,
        lastEmittedCoordsRef.current.lng,
        validCoords.lat,
        validCoords.lng
      );

      if (distKm * 1000 >= thresholdMeters) {
        lastEmittedCoordsRef.current = validCoords;
        setThrottledCoords(validCoords);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (!isMounted) return;
      console.warn('Geolocation warning / offline fallback:', error.message);

      // Fallback: Use map center if available, otherwise Esplanade center
      if (!lastEmittedCoordsRef.current) {
        if (mapInstance) {
          const center = mapInstance.getCenter();
          const fallback = clampToKolkata(center.lat, center.lng);
          lastEmittedCoordsRef.current = fallback;
          setThrottledCoords(fallback);
        } else {
          lastEmittedCoordsRef.current = { ...ESPLANADE_CENTER };
          setThrottledCoords({ ...ESPLANADE_CENTER });
        }
      }
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    });

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [thresholdMeters, mapInstance, rawCoords]);

  return throttledCoords;
}
