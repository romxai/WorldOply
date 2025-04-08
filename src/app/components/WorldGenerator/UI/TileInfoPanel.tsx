/**
 * TileInfoPanel.tsx
 *
 * Component for displaying detailed information about a selected or hovered tile.
 */

import React, { useState } from "react";
import { BiomeType } from "../config";

interface TileInfoPanelProps {
  tileInfo: string | null;
  position: "hover" | "selected";
  coordinates?: { x: number; y: number };
  onZoomToTile?: (x: number, y: number) => void;
  // New properties for actions
  onClaimTile?: (x: number, y: number) => void;
  onViewAuction?: (x: number, y: number) => void;
  isOwned?: boolean;
  isForSale?: boolean;
  owner?: string;
}

const TileInfoPanel: React.FC<TileInfoPanelProps> = ({
  tileInfo,
  position,
  coordinates,
  onZoomToTile,
  onClaimTile,
  onViewAuction,
  isOwned = false,
  isForSale = false,
  owner,
}) => {
  // Add state for info tabs
  const [activeTab, setActiveTab] = useState<'info' | 'resources' | 'actions'>('info');

  if (!tileInfo) return null;

  // For hover info, show a compact panel
  if (position === "hover") {
    return (
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded shadow-lg border border-gray-600 text-white text-sm max-w-xs z-10">
        <div className="font-semibold mb-1 text-blue-300 border-b border-gray-600 pb-1">
          Hover Position: X: {coordinates?.x}, Y: {coordinates?.y}
        </div>
        <pre className="text-xs whitespace-pre-wrap">
          {
            // Format the tileInfo to be more readable - just show the first few lines
            tileInfo.split("\n").slice(0, 6).join("\n")
          }
        </pre>
        <div className="text-xs text-gray-400 mt-1 italic">
          Click to select this tile for details
        </div>
      </div>
    );
  }

  // Parse tileInfo to extract relevant data
  const biomeMatch = tileInfo.match(/Biome: (.*)/);
  const biomeName = biomeMatch ? biomeMatch[1] : "Unknown";
  
  const elevationMatch = tileInfo.match(/Elevation: (.*)/);
  const elevation = elevationMatch ? elevationMatch[1] : "0";
  
  const moistureMatch = tileInfo.match(/Moisture: (.*)/);
  const moisture = moistureMatch ? moistureMatch[1] : "0";
  
  const temperatureMatch = tileInfo.match(/Temperature: (.*)/);
  const temperature = temperatureMatch ? temperatureMatch[1] : "0";
  
  // For selected info, show a more detailed panel with tabs
  return (
    <div className="absolute bottom-20 left-4 bg-gray-800 bg-opacity-90 p-3 rounded shadow-lg border border-gray-600 text-white text-sm max-w-xs z-10">
      <div className="font-semibold mb-1 text-green-300 border-b border-gray-600 pb-1">
        Selected Tile: X: {coordinates?.x}, Y: {coordinates?.y}
        {isOwned && <span className="ml-2 text-amber-300">• Owned by {owner}</span>}
        {isForSale && <span className="ml-2 text-amber-300">• For Sale</span>}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-600 mb-2">
        <button
          className={`py-1 px-2 text-xs ${activeTab === 'info' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
        <button
          className={`py-1 px-2 text-xs ${activeTab === 'resources' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
        <button
          className={`py-1 px-2 text-xs ${activeTab === 'actions' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="text-xs whitespace-pre-wrap overflow-y-auto max-h-60">
        {activeTab === 'info' && (
          <div>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div className="font-semibold">Biome:</div>
              <div>{biomeName}</div>
              <div className="font-semibold">Elevation:</div>
              <div>{elevation}</div>
              <div className="font-semibold">Moisture:</div>
              <div>{moisture}</div>
              <div className="font-semibold">Temperature:</div>
              <div>{temperature}</div>
            </div>
            <pre className="mt-2 border-t border-gray-600 pt-2 text-gray-300">
              {tileInfo}
            </pre>
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div>
            <p className="mb-2 italic text-gray-400">Resource information will be available in future updates.</p>
            <div className="p-2 bg-gray-700 rounded">
              <div className="font-semibold mb-1">Potential Resources:</div>
              <p>Resources will be determined by biome type and tile properties. {biomeName} biomes typically contain specific resources based on elevation and other factors.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'actions' && (
          <div className="flex flex-col gap-2">
            {onZoomToTile && coordinates && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs flex items-center justify-center"
                onClick={() => onZoomToTile(coordinates.x, coordinates.y)}
              >
                🔍 Zoom to Tile
              </button>
            )}
            
            {onClaimTile && coordinates && !isOwned && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-xs flex items-center justify-center"
                onClick={() => onClaimTile(coordinates.x, coordinates.y)}
              >
                🚩 Claim Tile
              </button>
            )}
            
            {onViewAuction && coordinates && (
              <button
                className="bg-amber-600 hover:bg-amber-700 text-white py-1 px-3 rounded text-xs flex items-center justify-center"
                onClick={() => onViewAuction(coordinates.x, coordinates.y)}
              >
                🏷️ {isForSale ? 'View Auction' : 'Check Availability'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TileInfoPanel;
