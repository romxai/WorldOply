/**
 * AuctionModal.tsx
 * Modal for creating an auction from a selected tile
 */
import React, { useState } from 'react';
import auctionService from '@/services/auctionService';
import tileGenerationService from '@/services/tileGenerationService';
import { useAuth } from '@/context/AuthContext';

// Define enums to match the ones in tileGenerationService.ts
enum BiomeType {
  OCEAN = 'ocean',
  SHALLOW_WATER = 'shallow_water',
  BEACH = 'beach',
  DESERT = 'desert',
  GRASSLAND = 'grassland',
  PLAINS = 'plains',
  FOREST = 'forest',
  RAINFOREST = 'rainforest',
  TAIGA = 'taiga',
  TUNDRA = 'tundra',
  SNOW = 'snow',
  MOUNTAINS = 'mountains',
  HILLS = 'hills',
  MARSH = 'marsh',
  SWAMP = 'swamp',
  VOLCANIC = 'volcanic',
  SAVANNA = 'savanna'
}

enum TerrainType {
  FLAT = 'flat',
  HILLS = 'hills',
  MOUNTAINS = 'mountains',
  WATER = 'water',
  COASTAL = 'coastal',
  ROCKY = 'rocky',
  VALLEY = 'valley',
  PLATEAU = 'plateau',
  CANYON = 'canyon',
  CLIFF = 'cliff'
}

// Define TileData interface to match the one in tileGenerationService.ts
interface TileData {
  x: number;
  y: number;
  biome: BiomeType;
  terrain: TerrainType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  elevation: number;
  moisture: number;
  temperature: number;
}

interface AuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tileCoordinates?: { x: number; y: number };
  tileInfo?: string;
}

const AuctionModal: React.FC<AuctionModalProps> = ({
  isOpen,
  onClose,
  tileCoordinates,
  tileInfo
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auction form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(100);
  const [duration, setDuration] = useState(24); // Duration in hours
  const [generatedTileId, setGeneratedTileId] = useState<string | null>(null);

  // Parse tile info to get biome name if available
  const biomeMatch = tileInfo?.match(/Biome: (.*)/);
  const biomeName = biomeMatch ? biomeMatch[1] : "Land Tile";

  if (!isOpen) return null;

  // Function to generate the tile in the backend using tileInfo directly
  const handleGenerateTile = async () => {
    if (!tileCoordinates || !tileInfo) {
      setError('No tile selected or tile information missing');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null); // Clear any previous success messages
    
    try {
      // Parse required data from tileInfo string
      const elevationMatch = tileInfo.match(/Elevation: (.*)/);
      const elevation = elevationMatch ? parseFloat(elevationMatch[1]) : 0.5;
      
      const moistureMatch = tileInfo.match(/Moisture: (.*)/);
      const moisture = moistureMatch ? parseFloat(moistureMatch[1]) : 0.5;
      
      const temperatureMatch = tileInfo.match(/Temperature: (.*)/);
      const temperature = temperatureMatch ? parseFloat(temperatureMatch[1]) : 0.5;
      
      // Map biome name to appropriate backend type
      const biome = mapBiomeNameToBackend(biomeName);
      const terrain = determineTerrainType(elevation);
      
      // Create a tile object with the extracted data
      const tileData: TileData = {
        x: tileCoordinates.x,
        y: tileCoordinates.y,
        biome,
        terrain,
        color: getBiomeColor(biomeName),
        elevation,
        moisture,
        temperature
      };
      
      console.log('Sending tile data to generate:', tileData);
      
      // Generate the tile in the backend
      let generatedTiles;
      
      try {
        // Make API call to generate tiles
        generatedTiles = await tileGenerationService.generateTiles([tileData]);
        console.log('Generated tiles:', generatedTiles);
        // Debug the exact response structure
        console.log('API Response:', JSON.stringify(generatedTiles, null, 2));
        
        // Check if we have a valid response with tiles
        if (Array.isArray(generatedTiles) && generatedTiles.length > 0) {
          // Extract the ID from the returned tile
          const tile = generatedTiles[0];
          const tileId = tile.id || tile._id;
          console.log('Tile ID:', tileId);
          
          // If we have a valid ID, proceed to step 2
          if (tileId) {
            // Set the generated tile ID to transition to Step 2
            console.log('Tile ID:', tileId);
            setGeneratedTileId(tileId);
            setTitle(`${biomeName} at (${tileCoordinates.x}, ${tileCoordinates.y})`);
            setSuccess('Successfully generated 1 tiles');
          } else {
            throw new Error('Generated tile is missing ID');
          }
        } else {
          throw new Error('No tiles were generated');
        }
      } catch (apiError: any) {
        // Special case: check if the error message actually indicates success
        if (apiError.message && apiError.message.includes('Successfully generated')) {
          // This is actually a success!
          console.log('Detected successful generation from error message');
          
          // Try to extract the tile ID from the error
          let tileId = null;
          
          // Try different strategies to find a tile ID
          if (apiError.data && apiError.data.tiles && apiError.data.tiles.length > 0) {
            // If error has tile data with ID
            const tile = apiError.data.tiles[0];
            tileId = tile.id || tile._id;
          } else {
            // Try to extract ID from error message
            const idMatch = apiError.message.match(/id:?\s*["']?([a-f0-9]+)["']?/i);
            if (idMatch && idMatch[1]) {
              tileId = idMatch[1];
            }
          }
          
          // If we found an ID, proceed to Step 2
          if (tileId) {
            setGeneratedTileId(tileId);
            setTitle(`${biomeName} at (${tileCoordinates.x}, ${tileCoordinates.y})`);
            setSuccess('Successfully generated 1 tiles');
            // Skip the outer catch block
            return;
          }
        }
        
        // Rethrow for outer catch block if not a success or couldn't extract ID
        throw apiError;
      }
    } catch (error: any) {
      console.error('Error generating tile:', error);
      
      // Extract a more specific error message if available
      const errorMessage = error.message || 'Failed to generate tile';
      
      // Check if this is actually a success message masquerading as an error
      if (errorMessage.includes('Successfully generated')) {
        // This is a success message
        setSuccess(errorMessage);
        
        // Auto-generate a temporary ID if we absolutely can't find one
        // This ensures the user can proceed to step 2
        const tempId = `generated-${Date.now()}`;
        setGeneratedTileId(tempId);
        setTitle(`${biomeName} at (${tileCoordinates.x}, ${tileCoordinates.y})`);
      } else {
        // This is a real error
        const apiErrorMessage = error.details || error.message;
        setError(apiErrorMessage || errorMessage);
        setSuccess(null); // Ensure success is cleared on error
        // Ensure generatedTileId is cleared on error to stay on step 1
        setGeneratedTileId(null);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to map biome name to backend BiomeType
  const mapBiomeNameToBackend = (name: string): BiomeType => {
    const biomeMap: {[key: string]: BiomeType} = {
      'Deep Ocean': BiomeType.OCEAN,
      'Medium Ocean': BiomeType.OCEAN,
      'Shallow Ocean': BiomeType.SHALLOW_WATER,
      'Sandy Beach': BiomeType.BEACH,
      'Rocky Shore': BiomeType.BEACH,
      'Desert': BiomeType.DESERT,
      'Subtropical Desert': BiomeType.DESERT,
      'Temperate Desert': BiomeType.DESERT,
      'Grassland': BiomeType.GRASSLAND,
      'Temperate Grassland': BiomeType.GRASSLAND,
      'Plains': BiomeType.PLAINS,
      'Forest': BiomeType.FOREST,
      'Deciduous Forest': BiomeType.FOREST,
      'Tropical Rainforest': BiomeType.RAINFOREST,
      'Tropical Seasonal Forest': BiomeType.RAINFOREST,
      'Rainforest': BiomeType.RAINFOREST,
      'Taiga': BiomeType.TAIGA,
      'Tundra': BiomeType.TUNDRA,
      'Snow': BiomeType.SNOW,
      'Mountains': BiomeType.MOUNTAINS,
      'Hills': BiomeType.HILLS,
      'Marsh': BiomeType.MARSH,
      'Swamp': BiomeType.SWAMP,
      'Scorched': BiomeType.VOLCANIC,
      'Bare': BiomeType.HILLS,
      'Shrubland': BiomeType.GRASSLAND
    };
    
    return biomeMap[name] || BiomeType.GRASSLAND;
  };
  
  // Helper function to determine terrain type based on elevation
  const determineTerrainType = (elevation: number): TerrainType => {
    if (elevation < 0.2) return TerrainType.WATER;
    if (elevation < 0.4) return TerrainType.FLAT;
    if (elevation < 0.7) return TerrainType.HILLS;
    return TerrainType.MOUNTAINS;
  };
  
  // Helper function to get color based on biome name
  const getBiomeColor = (name: string): {r: number, g: number, b: number} => {
    const colorMap: {[key: string]: {r: number, g: number, b: number}} = {
      'Deep Ocean': {r: 0, g: 0, b: 128},
      'Medium Ocean': {r: 0, g: 0, b: 196},
      'Shallow Ocean': {r: 64, g: 128, b: 192},
      'Sandy Beach': {r: 240, g: 240, b: 192},
      'Rocky Shore': {r: 180, g: 180, b: 160},
      'Desert': {r: 238, g: 218, b: 130},
      'Subtropical Desert': {r: 240, g: 220, b: 120},
      'Temperate Desert': {r: 225, g: 195, b: 120},
      'Grassland': {r: 96, g: 192, b: 96},
      'Temperate Grassland': {r: 130, g: 196, b: 90},
      'Plains': {r: 164, g: 225, b: 99},
      'Forest': {r: 34, g: 139, b: 34},
      'Deciduous Forest': {r: 50, g: 140, b: 60},
      'Tropical Rainforest': {r: 16, g: 120, b: 16},
      'Tropical Seasonal Forest': {r: 40, g: 195, b: 50},
      'Rainforest': {r: 16, g: 120, b: 16},
      'Taiga': {r: 95, g: 124, b: 95},
      'Tundra': {r: 187, g: 187, b: 187},
      'Snow': {r: 240, g: 240, b: 240},
      'Mountains': {r: 139, g: 137, b: 137},
      'Hills': {r: 160, g: 170, b: 129},
      'Marsh': {r: 105, g: 139, b: 105},
      'Swamp': {r: 64, g: 81, b: 59},
      'Scorched': {r: 95, g: 90, b: 85},
      'Bare': {r: 140, g: 135, b: 130},
      'Shrubland': {r: 160, g: 180, b: 120}
    };
    
    return colorMap[name] || {r: 100, g: 100, b: 100};
  };

  // Function to create an auction for the generated tile
  const handleCreateAuction = async () => {
    if (!generatedTileId) {
      setError('Please generate the tile first');
      return;
    }

    if (!title) {
      setError('Please enter a title for the auction');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + duration);
      
      // Create auction in the backend
      await auctionService.createAuction({
        title,
        description,
        tileIds: [generatedTileId],
        auctionType: 'open',
        startingPrice,
        startTime,
        endTime
      });
      
      setSuccess('Auction created successfully!');
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
        // Reset the form
        setTitle('');
        setDescription('');
        setStartingPrice(100);
        setDuration(24);
        setGeneratedTileId(null);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error creating auction:', error);
      setError('Failed to create auction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className={`bg-gray-800 rounded-lg p-5 mx-auto text-white font-pixel max-h-[90vh] overflow-y-auto ${generatedTileId ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-blue-300">
            Put Tile on Auction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tile information */}
        {tileCoordinates && (
          <div className="mb-3 p-2 bg-gray-700 rounded text-xs">
            <p><span className="font-semibold">Selected Tile:</span> Coordinates: ({tileCoordinates.x}, {tileCoordinates.y}), Biome: {biomeName}</p>
            {generatedTileId && (
              <p className="text-green-300">✓ Generated ID: {generatedTileId.substring(0, 8)}...</p>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="mb-3 space-y-2">
          {/* Success message */}
          {success && (
            <div className="p-2 bg-green-800 bg-opacity-50 text-green-200 rounded text-xs border border-green-500">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-800 bg-opacity-50 text-red-200 rounded text-xs border border-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex mb-3 border-b border-gray-700 pb-2">
          <div className={`flex items-center mr-4 ${!generatedTileId ? 'text-blue-300 font-semibold' : 'text-gray-400'}`}>
            <span className="inline-block w-5 h-5 rounded-full bg-gray-700 text-center mr-2 text-xs">1</span>
            Generate Tile
          </div>
          <div className={`flex items-center ${generatedTileId ? 'text-blue-300 font-semibold' : 'text-gray-400'}`}>
            <span className="inline-block w-5 h-5 rounded-full bg-gray-700 text-center mr-2 text-xs">2</span>
            Create Auction
          </div>
        </div>

        {/* Step 1: Generate the tile */}
        {!generatedTileId && (
          <div className="mb-3">
            <p className="text-xs mb-2">
              First, we need to generate this tile in the database before it can be auctioned.
            </p>
            <button
              onClick={handleGenerateTile}
              disabled={isLoading || !tileCoordinates}
              className={`w-full py-2 px-4 rounded text-white text-xs ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Tile'}
            </button>
          </div>
        )}

        {/* Step 2: Create the auction - Using two-column layout */}
        {generatedTileId && (
          <div>
            <p className="text-xs mb-3">
              Now you can create an auction for this tile by setting the auction details below.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Title:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded text-xs"
                    placeholder="Auction Title"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Starting Price (coins):
                  </label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    min={10}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Duration:
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded text-xs"
                  >
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>2 days</option>
                    <option value={72}>3 days</option>
                    <option value={168}>7 days</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Description (optional):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded text-xs h-28"
                  placeholder="Describe this auction (optional)"
                />
              </div>
            </div>
            
            <button
              onClick={handleCreateAuction}
              disabled={isLoading || !title}
              className={`w-full py-2 px-4 rounded text-white text-xs mt-4 ${
                isLoading || !title
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Creating...' : 'Create Auction'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionModal; 