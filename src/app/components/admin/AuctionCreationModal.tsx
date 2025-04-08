import React, { useState } from 'react';
import { toast } from 'react-toastify';
import auctionService from '../../../services/auctionService';
import tileService from '../../../services/tileService';
import { TileGenerationData, AuctionCreationData } from '../../../types/auction';

// Biome types and terrain types from database models
const BIOME_TYPES = [
  'ocean', 'shallow_water', 'beach', 'desert', 'grassland', 
  'plains', 'forest', 'rainforest', 'taiga', 'tundra', 
  'snow', 'mountains', 'hills', 'marsh', 'swamp', 'volcanic', 'savanna'
];

const TERRAIN_TYPES = [
  'flat', 'hills', 'mountains', 'water', 
  'coastal', 'rocky', 'valley', 'plateau', 'canyon', 'cliff'
];

interface AuctionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for creating auctions with generated tiles
 */
const AuctionCreationModal: React.FC<AuctionCreationModalProps> = ({ isOpen, onClose }) => {
  // Modal states
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tile generation states
  const [numTiles, setNumTiles] = useState(10);
  const [startX, setStartX] = useState(500);
  const [startY, setStartY] = useState(500);
  const [biomeType, setBiomeType] = useState('grassland');
  const [terrainType, setTerrainType] = useState('flat');
  const [generatedTiles, setGeneratedTiles] = useState<any[]>([]);
  
  // Auction creation states
  const [auctionTitle, setAuctionTitle] = useState('');
  const [auctionDescription, setAuctionDescription] = useState('');
  const [auctionType, setAuctionType] = useState<'open' | 'blind'>('open');
  const [startingPrice, setStartingPrice] = useState(1000);
  const [durationDays, setDurationDays] = useState(3);
  
  // Close the modal and reset states
  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setGeneratedTiles([]);
  };
  
  // Generate tiles based on form inputs
  const handleGenerateTiles = async () => {
    try {
      setIsLoading(true);
      
      // Create tile data array
      const tiles: TileGenerationData[] = [];
      
      // Generate tiles around the starting point
      for (let i = 0; i < numTiles; i++) {
        // Create a random offset around the starting point
        const xOffset = Math.floor(Math.random() * 20) - 10;
        const yOffset = Math.floor(Math.random() * 20) - 10;
        
        tiles.push({
          location: {
            x: startX + xOffset,
            y: startY + yOffset
          },
          biomeType,
          terrainType,
          resources: {}
        });
      }
      
      // Generate tiles via the API
      const response = await tileService.generateTiles(tiles);
      
      if (response.tiles) {
        setGeneratedTiles(response.tiles);
        toast.success(`Successfully generated ${response.tiles.length} tiles`);
        
        // Move to the next step
        setCurrentStep(2);
      } else {
        toast.error('Failed to generate tiles');
      }
    } catch (error) {
      console.error('Error generating tiles:', error);
      toast.error('Error generating tiles');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create an auction with the generated tiles
  const handleCreateAuction = async () => {
    try {
      setIsLoading(true);
      
      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + durationDays);
      
      // Create auction data
      const auctionData: AuctionCreationData = {
        title: auctionTitle,
        description: auctionDescription,
        tileIds: generatedTiles.map(tile => tile._id),
        auctionType,
        startingPrice,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
      
      // Create the auction
      const auction = await auctionService.createAuction(auctionData);
      
      if (auction._id) {
        toast.success('Auction created successfully!');
        handleClose();
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
  
  // Render steps based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Generate Tiles</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Tiles
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numTiles}
                  onChange={(e) => setNumTiles(Math.min(50, parseInt(e.target.value) || 1))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Biome Type
                </label>
                <select
                  value={biomeType}
                  onChange={(e) => setBiomeType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {BIOME_TYPES.map((biome) => (
                    <option key={biome} value={biome}>
                      {biome.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Terrain Type
                </label>
                <select
                  value={terrainType}
                  onChange={(e) => setTerrainType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {TERRAIN_TYPES.map((terrain) => (
                    <option key={terrain} value={terrain}>
                      {terrain}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Starting X Coordinate
                </label>
                <input
                  type="number"
                  value={startX}
                  onChange={(e) => setStartX(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Starting Y Coordinate
                </label>
                <input
                  type="number"
                  value={startY}
                  onChange={(e) => setStartY(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerateTiles}
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Tiles'}
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Create Auction</h2>
            
            <div className="grid grid-cols-1 gap-4">
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
              
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Creating auction for {generatedTiles.length} tiles
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleCreateAuction}
                disabled={isLoading || !auctionTitle}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Auction'}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
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
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Create New Auction
                </h3>
                
                <div className="mt-4">
                  {renderStepContent()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCreationModal; 