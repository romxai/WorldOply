/**
 * TileInfoPanel.tsx
 *
 * Component for displaying detailed information about a selected or hovered tile.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Tab } from '@headlessui/react';
import { TileWithOwnership } from '@/types/auction';
import { AuctionInfo } from './AuctionInfo';
import { useTileAuctionStatus } from '@/hooks/useTileAuctionStatus';
import { useAuctionService } from '@/hooks/useAuctionService';
import { cn } from '@/utils/cn';
import { type AuctionBidInfo } from '@/types/auction';

interface TileInfoPanelProps {
  tile: TileWithOwnership;
  onClose: () => void;
  initialTab?: number;
}

export const TileInfoPanel: React.FC<TileInfoPanelProps> = ({ 
  tile, 
  onClose,
  initialTab = 0
}) => {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const { placeBid } = useAuctionService();
  
  // Use our new hook instead of manually fetching auction info
  const { 
    auctions: tileAuctions, 
    auctionInfo, 
    loading: isLoadingAuction 
  } = useTileAuctionStatus(tile.tileId);

  useEffect(() => {
    // If there's an active auction and initialTab is for auction tab, switch to it
    if (initialTab === 1 || (tile.ownership?.inAuction && auctionInfo)) {
      setSelectedTab(1);
    }
  }, [tile.tileId, tile.ownership?.inAuction, auctionInfo, initialTab]);

  const handleBidPlaced = () => {
    // We don't need to do anything here as the hook will refresh automatically
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tile Information</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }: { selected: boolean }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            Details
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                // Show indicator for active auctions
                tile.ownership?.inAuction ? 'relative' : ''
              )
            }
          >
            Auction
            {tile.ownership?.inAuction && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Location</h3>
                <p>X: {tile.coordinates.x}, Y: {tile.coordinates.y}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Terrain</h3>
                <p>Biome: {tile.biome}</p>
                <p>Elevation: {tile.elevation.toFixed(2)}</p>
                <p>Temperature: {tile.temperature.toFixed(2)}°C</p>
                <p>Moisture: {tile.moisture.toFixed(2)}%</p>
              </div>
              {tile.resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Resources</h3>
                  <ul>
                    {tile.resources.map((resource, index) => (
                      <li key={index}>
                        {resource.type}: {resource.amount}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            {isLoadingAuction ? (
              <div className="p-4 text-center">
                <p>Loading auction information...</p>
              </div>
            ) : (
              tile.ownership && (
                <AuctionInfo
                  tileId={tile.tileId}
                  ownership={tile.ownership}
                  auctionInfo={auctionInfo || undefined}
                  onBidPlaced={handleBidPlaced}
                />
              )
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
