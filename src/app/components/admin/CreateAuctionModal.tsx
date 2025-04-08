import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import auctionService from '../../../services/auctionService';
import tileService from '../../../services/tileService';
import { AuctionCreationData, TileGenerationData } from '../../../types/auction';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTiles: Array<{ x: number; y: number; info: string }>;
}

/**
 * Modal component for creating auctions with selected tiles
 */
const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedTiles 
}) => {
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [auctionTitle, setAuctionTitle] = useState('');
  const [auctionDescription, setAuctionDescription] = useState('');
  const [auctionType, setAuctionType] = useState<'open' | 'blind'>('open');
  const [startingPrice, setStartingPrice] = useState(1000);
  const [durationDays, setDurationDays] = useState(3);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuctionTitle(`Auction for ${selectedTiles.length} tiles`);
      setAuctionDescription(`Auction for selected tiles at coordinates: ${selectedTiles.map(t => `(${t.x},${t.y})`).join(', ')}`);
    }
  }, [isOpen, selectedTiles]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auctionTitle) {
      toast.error('Please enter an auction title');
      return;
    }
    
    if (selectedTiles.length === 0) {
      toast.error('Please select at least one tile');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // First, generate the tiles in the database
      // Create tile data with biome info from selected tiles
      const tileDataArray: TileGenerationData[] = selectedTiles.map(tile => {
        // Parse the biome from the info string
        const biomeMatch = tile.info.match(/Biome: ([a-z_]+)/i);
        const biomeType = biomeMatch ? biomeMatch[1] : 'grassland';
        
        // Get elevation from info
        const elevationMatch = tile.info.match(/Elevation: ([0-9.]+)/i);
        const elevation = elevationMatch ? parseFloat(elevationMatch[1]) : 0.5;
        
        // Determine terrain type based on elevation
        let terrainType = 'flat';
        if (elevation > 0.7) {
          terrainType = 'mountains';
        } else if (elevation > 0.5) {
          terrainType = 'hills';
        } else if (elevation < 0.2) {
          terrainType = 'valley';
        }
        
        return {
          location: {
            x: tile.x,
            y: tile.y
          },
          biomeType,
          terrainType
        };
      });
      
      // Generate tiles in the database
      const generateResponse = await tileService.generateTiles(tileDataArray);
      
      if (!generateResponse.tiles || generateResponse.tiles.length === 0) {
        toast.error('Failed to generate tiles');
        return;
      }
      
      // Now create the auction with the generated tile IDs
      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + durationDays);
      
      // Create auction data with actual tile IDs from the generated tiles
      const auctionData: AuctionCreationData = {
        title: auctionTitle,
        description: auctionDescription,
        tileIds: generateResponse.tiles.map((tile: any) => tile._id),
        auctionType,
        startingPrice,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
      
      // Create the auction
      const auction = await auctionService.createAuction(auctionData);
      
      if (auction._id) {
        toast.success('Auction created successfully!');
        onClose();
      } else {
        toast.error('Failed to create auction');
      }
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Error creating auction');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Create Auction with Selected Tiles
                  </h3>
                  
                  <div className="mt-4 space-y-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedTiles.length} tiles selected
                      </span>
                      <div className="mt-1 max-h-24 overflow-auto text-xs text-gray-500">
                        {selectedTiles.map(tile => (
                          <div key={`${tile.x}-${tile.y}`} className="mb-1">
                            Tile ({tile.x}, {tile.y})
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Auction Title*
                      </label>
                      <input
                        type="text"
                        value={auctionTitle}
                        onChange={(e) => setAuctionTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={auctionDescription}
                        onChange={(e) => setAuctionDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Auction Type
                        </label>
                        <select
                          value={auctionType}
                          onChange={(e) => setAuctionType(e.target.value as 'open' | 'blind')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="open">Open Bidding</option>
                          <option value="blind">Blind Bidding</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Starting Price
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={startingPrice}
                          onChange={(e) => setStartingPrice(parseInt(e.target.value) || 0)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Duration (days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={durationDays}
                          onChange={(e) => setDurationDays(Math.min(30, parseInt(e.target.value) || 1))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={isLoading || !auctionTitle || selectedTiles.length === 0}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isLoading ? 'Creating...' : 'Create Auction'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionModal; 