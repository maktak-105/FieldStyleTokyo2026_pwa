import React from 'react';
import { Compass, AlertCircle } from 'lucide-react';
import { useCompass } from '../hooks/useCompass';
import type { Booth } from '../types';

interface CompassNavigatorProps {
  currentLocation: Booth | null;
  destination: Booth | null;
}

export const CompassNavigator: React.FC<CompassNavigatorProps> = ({ currentLocation, destination }) => {
  const { heading, error, needsPermissionRequest, requestPermission, permissionGranted } = useCompass();

  // Simple relative bearing calculation
  // (In a real map, you need latitude/longitude to calculate true bearing. 
  // Here we use pixel coordinates assuming map North is UP (y-axis decreasing))
  const getBearing = () => {
    if (!currentLocation || !destination) return 0;
    const dx = destination.x - currentLocation.x;
    const dy = destination.y - currentLocation.y; // SVG y-axis is down
    // Atan2 gives angle from positive X axis. We need angle from North (negative Y)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Convert to bearing (0 is North)
    let bearing = angle + 90; 
    if (bearing < 0) bearing += 360;
    return bearing;
  };

  if (!currentLocation || !destination) {
    return null;
  }

  // If destination and current location are on different maps, compass cannot compute a simple pixel bearing
  if (currentLocation.mapId !== destination.mapId) {
    return (
      <div className="compass-widget">
        <AlertCircle size={20} className="text-yellow-500" />
        <span className="text-xs font-semibold">Different Map</span>
      </div>
    );
  }

  const targetBearing = getBearing();
  // Arrow rotation: targetBearing - currentHeading
  const arrowRotation = heading !== null ? (targetBearing - heading) : targetBearing;

  return (
    <div className="compass-widget">
      {needsPermissionRequest && !permissionGranted ? (
        <button className="compass-btn" onClick={requestPermission}>
          <Compass size={18} />
          <span>Enable Compass</span>
        </button>
      ) : error ? (
        <div className="compass-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="compass-dial">
          <div className="compass-ring"></div>
          <div 
            className="compass-arrow" 
            style={{ transform: `rotate(${arrowRotation}deg)` }}
          >
            <div className="arrow-head"></div>
          </div>
          <div className="compass-distance">
            {/* Simple pixel distance as proxy */}
            {Math.floor(Math.sqrt(Math.pow(destination.x - currentLocation.x, 2) + Math.pow(destination.y - currentLocation.y, 2)))} m
          </div>
        </div>
      )}
    </div>
  );
};
