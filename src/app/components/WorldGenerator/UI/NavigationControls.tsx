/**
 * NavigationControls.tsx
 *
 * Component for controlling map navigation with fixed buttons.
 */

import React from "react";

interface NavigationControlsProps {
  onPan: (direction: "up" | "down" | "left" | "right") => void;
  onZoom: (zoomIn: boolean) => void;
  onZoomToCoordinates?: (x: number, y: number, zoomLevel?: number) => void;
  onResetZoom?: () => void;
  selectedTileCoords?: { x: number; y: number } | null;
  hasSelection?: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPan,
  onZoom,
  onZoomToCoordinates,
  onResetZoom,
  selectedTileCoords,
  hasSelection = false,
}) => {
  // Handler for zooming to selected tile
  const handleZoomToSelection = () => {
    if (onZoomToCoordinates && selectedTileCoords) {
      onZoomToCoordinates(selectedTileCoords.x, selectedTileCoords.y, 2.0); // Zoom level 2.0 for closer view
    }
  };

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 select-none">
      <div className="text-white text-center text-xs mb-1 font-medium bg-gray-800 bg-opacity-70 rounded-md p-1">
        Map Navigation
      </div>

      {/* Reset Zoom Button */}
      {onResetZoom && (
        <div className="mb-2">
          <button
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-1 px-2 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg border border-gray-600"
            onClick={onResetZoom}
            aria-label="Reset Zoom"
          >
            🌍 Full Map
          </button>
        </div>
      )}

      {/* Selection Controls - only show if selection feature is available */}
      {onZoomToCoordinates && (
        <div className="mb-2">
          <button
            className={`w-full bg-gray-800 hover:bg-gray-700 text-white py-1 px-2 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg border border-gray-600 ${
              !hasSelection ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleZoomToSelection}
            disabled={!hasSelection}
            aria-label="Zoom to Selection"
          >
            🔍 Selection
          </button>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex justify-center mb-2">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-l-lg flex items-center justify-center text-xl font-bold shadow-lg border border-gray-600"
          onClick={() => onZoom(false)}
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-r-lg flex items-center justify-center text-xl font-bold shadow-lg border border-gray-600 border-l-0"
          onClick={() => onZoom(true)}
          aria-label="Zoom In"
        >
          +
        </button>
      </div>

      {/* Direction Controls */}
      <div className="flex justify-center">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("up")}
          aria-label="Pan Up"
        >
          ↑
        </button>
      </div>
      <div className="flex justify-between">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("left")}
          aria-label="Pan Left"
        >
          ←
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("right")}
          aria-label="Pan Right"
        >
          →
        </button>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-gray-600"
          onClick={() => onPan("down")}
          aria-label="Pan Down"
        >
          ↓
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
