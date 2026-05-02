import React from 'react';
import { SearchBar } from './SearchBar';
import type { Booth } from '../types';

interface LocationPickerProps {
  booths: Booth[];
  currentLocation: Booth | null;
  destination: Booth | null;
  onSetCurrentLocation: (booth: Booth | null) => void;
  onSetDestination: (booth: Booth | null) => void;
  onGoToCurrent?: () => void;
  onGoToDestination?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  booths,
  currentLocation,
  destination,
  onSetCurrentLocation,
  onSetDestination,
  onGoToCurrent,
  onGoToDestination,
}) => {
  return (
    <div className="location-picker">
      <div className="location-row">
        <button 
          className={`icon-circle red-bg ${currentLocation ? 'active' : ''}`}
          onClick={onGoToCurrent}
          disabled={!currentLocation}
        >
          A
        </button>
        <SearchBar
          booths={booths}
          value={currentLocation}
          onSelect={onSetCurrentLocation}
          placeholder="現在地 (A)"
        />
      </div>
      
      <div className="location-row-spacer"></div>

      <div className="location-row">
        <button 
          className={`icon-circle blue-bg ${destination ? 'active' : ''}`}
          onClick={onGoToDestination}
          disabled={!destination}
        >
          B
        </button>
        <SearchBar
          booths={booths}
          value={destination}
          onSelect={onSetDestination}
          placeholder="目的地 (B)"
        />
      </div>
    </div>
  );
};
