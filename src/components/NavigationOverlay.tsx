import React from 'react';
import type { Booth } from '../types';

interface NavigationOverlayProps {
  currentLocation: Booth | null;
  destination: Booth | null;
  imageWidth: number;
  imageHeight: number;
  showRoute?: boolean;
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  currentLocation,
  destination,
  imageWidth,
  imageHeight,
  showRoute = true,
}) => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#3b82f6" />
        </marker>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {showRoute && currentLocation && destination && (
        <line
          x1={currentLocation.x} y1={currentLocation.y}
          x2={destination.x} y2={destination.y}
          stroke="#3b82f6" strokeWidth="12" strokeDasharray="1, 20"
          strokeLinecap="round" filter="url(#glow)" className="animate-flow"
        />
      )}

      {currentLocation && (
        <g transform={`translate(${currentLocation.x}, ${currentLocation.y})`}>
          <circle r="30" fill="#ef4444" opacity="0.3" className="animate-pulse" />
          <circle r="12" fill="#ef4444" stroke="white" strokeWidth="3" />
        </g>
      )}

      {destination && (
        <g transform={`translate(${destination.x}, ${destination.y})`}>
          <path
            d="M 0 0 C -15 -20 -25 -35 -25 -50 A 25 25 0 1 1 25 -50 C 25 -35 15 -20 0 0 Z"
            fill="#3b82f6" stroke="white" strokeWidth="3"
          />
          {/* 番号をさらに大きく、太く */}
          <text 
            y="-85" textAnchor="middle" fill="white" fontSize="32" fontWeight="900"
            stroke="#1e40af" strokeWidth="8" paintOrder="stroke"
          >
            {destination['西展示棟1F']}
          </text>
        </g>
      )}
    </svg>
  );
};
