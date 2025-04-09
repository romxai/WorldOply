/**
 * TileInfoPanel.tsx
 *
 * Component for displaying detailed information about a selected or hovered tile.
 */

import React, { useState, useEffect } from "react";
import { BiomeType } from "../config";
import tileGenerationService from "@/services/tileGenerationService";
import auctionService from "@/services/auctionService";
import { useAuth } from "@/context/AuthContext";

// Auction creation states
enum AuctionCreationState {
  IDLE = "idle",
  GENERATING_TILE = "generating-tile",
  TILE_GENERATED = "tile-generated",
  CREATING_AUCTION = "creating-auction",
  AUCTION_CREATED = "auction-created",
  ERROR = "error"
}

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

  // Add state for auction creation process
  const [auctionState, setAuctionState] = useState<AuctionCreationState>(AuctionCreationState.IDLE);
  const [generatedTileId, setGeneratedTileId] = useState<string | null>(null);
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add state for checking auction details
  const [checkingAuction, setCheckingAuction] = useState<boolean>(false);
  const [auctionDetails, setAuctionDetails] = useState<any>(null);

  // Auction parameters
  const [auctionTitle, setAuctionTitle] = useState<string>("");
  const [startingPrice, setStartingPrice] = useState<number>(100);
  const [durationHours, setDurationHours] = useState<number>(24);

  // Authentication context for user info
  const { user } = useAuth();

  // Add useEffect to check auction status when selected
  useEffect(() => {
    if (isForSale && coordinates) {
      setCheckingAuction(true);

      const checkAuctionDetails = async () => {
        try {
          const tileInfo = await tileGenerationService.checkTileAvailability(
            coordinates.x,
            coordinates.y
          );

          setAuctionDetails(tileInfo);
        } catch (error) {
          console.error("Error checking auction status:", error);
        } finally {
          setCheckingAuction(false);
        }
      };

      checkAuctionDetails();
    }
  }, [isForSale, coordinates]);

  if (!tileInfo) return null;

  // Parse tileInfo to extract relevant data
  const biomeMatch = tileInfo.match(/Biome: (.*)/);
  const biomeName = biomeMatch ? biomeMatch[1] : "Unknown";

  const elevationMatch = tileInfo.match(/Elevation: (.*)/);
  const elevation = elevationMatch ? elevationMatch[1] : "0";

  const moistureMatch = tileInfo.match(/Moisture: (.*)/);
  const moisture = moistureMatch ? moistureMatch[1] : "0";

  const temperatureMatch = tileInfo.match(/Temperature: (.*)/);
  const temperature = temperatureMatch ? temperatureMatch[1] : "0";

  // Handle creation of a tile and auction
  const handleCreateAuction = async () => {
    if (!coordinates) {
      setErrorMessage("No coordinates available for this tile");
      setAuctionState(AuctionCreationState.ERROR);
      return;
    }

    if (!user) {
      setErrorMessage("You must be logged in to create an auction");
      setAuctionState(AuctionCreationState.ERROR);
      return;
    }

    try {
      // First check if this tile already exists or is in an auction
      const tileAvailability = await tileGenerationService.checkTileAvailability(
        coordinates.x,
        coordinates.y
      );

      if (tileAvailability.exists) {
        if (tileAvailability.owned) {
          setErrorMessage(`This tile is already owned by ${tileAvailability.owner || "another player"}`);
          setAuctionState(AuctionCreationState.ERROR);
          return;
        }

        if (tileAvailability.inAuction) {
          setErrorMessage("This tile is already up for auction");
          setAuctionState(AuctionCreationState.ERROR);
          return;
        }
      }

      // Step 1: Generate the tile
      setAuctionState(AuctionCreationState.GENERATING_TILE);

      // Pre-populate auction title based on biome and coordinates
      const defaultTitle = `${biomeName} at (${coordinates.x}, ${coordinates.y})`;
      setAuctionTitle(defaultTitle);

      // Get data for the selected tile from the world generator
      const frontendBiomeType = parseInt(tileInfo.match(/Biome Type ID: (\d+)/)?.[1] || "0");

      // Manually create a tile data object for this specific tile
      const tileData = {
        x: coordinates.x,
        y: coordinates.y,
        biome: tileGenerationService.getBiomeTypeFromFrontendId(frontendBiomeType),
        terrain: tileGenerationService.getTerrainTypeFromTileData(frontendBiomeType, parseFloat(elevation)),
        color: {
          r: Math.floor(Math.random() * 255),
          g: Math.floor(Math.random() * 255),
          b: Math.floor(Math.random() * 255)
        },
        elevation: parseFloat(elevation),
        moisture: parseFloat(moisture),
        temperature: parseFloat(temperature)
      };

      // Generate the tile in the backend
      const generatedTiles = await tileGenerationService.generateTiles([tileData]);

      // Check if we have a valid response with tiles
      if (!generatedTiles || generatedTiles.length === 0) {
        throw new Error("No tiles were generated");
      }

      // Check if the biome type is ocean - might not be auctionable
      const generatedBiomeType = generatedTiles[0].biome;
      if (generatedBiomeType === 'ocean' || generatedBiomeType === 'shallow_water') {
        setErrorMessage("Cannot create auction for ocean tiles");
        setAuctionState(AuctionCreationState.ERROR);
        return;
      }

      // Extract the tile ID
      const tileId = generatedTiles[0]._id || generatedTiles[0].id;

      if (!tileId) {
        throw new Error("Generated tile is missing ID");
      }

      setGeneratedTileId(tileId);
      setAuctionState(AuctionCreationState.TILE_GENERATED);

    } catch (error: any) {
      console.error("Error generating tile:", error);
      setErrorMessage(error.message || "Failed to generate tile");
      setAuctionState(AuctionCreationState.ERROR);
    }
  };

  // Handle creating the auction after tile generation
  const handleCreateAuctionWithTile = async () => {
    if (!generatedTileId) {
      setErrorMessage("No tile ID available");
      setAuctionState(AuctionCreationState.ERROR);
      return;
    }

    try {
      // Step 2: Create the auction
      setAuctionState(AuctionCreationState.CREATING_AUCTION);

      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + durationHours);

      // Create auction data
      const auctionData = {
        title: auctionTitle,
        description: `Auction for a ${biomeName} tile at coordinates (${coordinates?.x}, ${coordinates?.y})`,
        tileIds: [generatedTileId],
        auctionType: "open",
        startingPrice: startingPrice,
        startTime: startTime,
        endTime: endTime
      };

      // Create the auction
      const createdAuction = await auctionService.createAuction(auctionData);

      // The response is the auction object itself from the backend
      if (createdAuction && createdAuction._id) {
        // Store the auction ID
        setAuctionId(createdAuction._id);
        setAuctionState(AuctionCreationState.AUCTION_CREATED);
      } else {
        console.log("Created auction:", createdAuction);
        setAuctionState(AuctionCreationState.AUCTION_CREATED);
      }

    } catch (error: any) {
      console.error("Error creating auction:", error);
      setErrorMessage(error.message || "Failed to create auction");
      setAuctionState(AuctionCreationState.ERROR);
    }
  };

  // Reset the auction creation process
  const resetAuctionCreation = () => {
    setAuctionState(AuctionCreationState.IDLE);
    setGeneratedTileId(null);
    setAuctionId(null);
    setErrorMessage(null);
  };

  // View the created auction
  const viewCreatedAuction = () => {
    if (auctionId && onViewAuction && coordinates) {
      onViewAuction(coordinates.x, coordinates.y);
    }
  };

  // For selected info, show a more detailed panel with tabs
  if (position === "selected") {
    return (
      <div className="absolute bottom-20 left-4 bg-amber-700/90 border-2 border-amber-900 p-2 font-pixel text-xs z-10 w-[300px]">
        <div className="text-amber-100 border-b border-amber-900 pb-1 mb-2 truncate">
          Selected Tile: X: {coordinates?.x}, Y: {coordinates?.y}
          {isOwned && <span className="ml-2 text-amber-300">• Owned by {owner}</span>}
          {isForSale && <span className="ml-2 text-amber-300">• For Sale</span>}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 mb-2 w-full">
          <button
            className={`py-1 px-3 text-xxs border-2 border-amber-900 flex-1 ${activeTab === 'info'
                ? 'bg-amber-800 text-amber-100 border-b-0'
                : 'bg-amber-600 text-amber-200 border-b-2'
              }`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`py-1 px-3 text-xxs border-2 border-l-0 border-amber-900 flex-1 ${activeTab === 'resources'
                ? 'bg-amber-800 text-amber-100 border-b-0'
                : 'bg-amber-600 text-amber-200 border-b-2'
              }`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button
            className={`py-1 px-3 text-xxs border-2 border-l-0 border-amber-900 flex-1 ${activeTab === 'actions'
                ? 'bg-amber-800 text-amber-100 border-b-0'
                : 'bg-amber-600 text-amber-200 border-b-2'
              }`}
            onClick={() => setActiveTab('actions')}
          >
            Actions
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xxs whitespace-pre-wrap overflow-y-auto max-h-60 bg-amber-800/80 border-2 border-amber-900 p-2 w-full">
          {activeTab === 'info' && (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <div className="text-amber-200">Biome:</div>
                <div className="text-amber-100 truncate">{biomeName}</div>
                <div className="text-amber-200">Elevation:</div>
                <div className="text-amber-100 truncate">{elevation}</div>
                <div className="text-amber-200">Moisture:</div>
                <div className="text-amber-100 truncate">{moisture}</div>
                <div className="text-amber-200">Temperature:</div>
                <div className="text-amber-100 truncate">{temperature}</div>
              </div>
              <pre className="mt-2 border-t border-amber-900 pt-2 text-amber-100 break-words overflow-x-hidden">
                {tileInfo}
              </pre>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <p className="mb-2 italic text-amber-200 break-words">Resource information will be available in future updates.</p>
              <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                <div className="text-amber-100 mb-1">Potential Resources:</div>
                <p className="text-amber-200 break-words">{biomeName} biome resources will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="flex flex-col gap-2">
              {onZoomToTile && coordinates && (
                <button
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900 flex items-center justify-center w-full"
                  onClick={() => onZoomToTile(coordinates.x, coordinates.y)}
                >
                  🔍 Zoom to Tile
                </button>
              )}

              {onClaimTile && coordinates && !isOwned && !isForSale && (
                <button
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900 flex items-center justify-center w-full"
                  onClick={() => onClaimTile(coordinates.x, coordinates.y)}
                >
                  🚩 Claim Tile
                </button>
              )}

              {onViewAuction && coordinates && (
                <button
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900 flex items-center justify-center w-full"
                  onClick={() => onViewAuction(coordinates.x, coordinates.y)}
                >
                  🏷️ {isForSale ? 'View Auction' : 'Check Availability'}
                </button>
              )}

              {/* Show auction status if tile is already in an auction */}
              {isForSale && (
                <div className="bg-amber-700/80 border-2 border-amber-900 p-2 w-full">
                  <h4 className="text-amber-100 mb-1">Tile In Auction</h4>
                  <p className="text-amber-200 mb-2 break-words">This tile is currently available for bidding in the auction house.</p>
                  {checkingAuction ? (
                    <div className="text-center">
                      <div className="animate-pulse text-amber-200">Checking auction details...</div>
                    </div>
                  ) : (
                    <button
                      className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900 w-full"
                      onClick={() => onViewAuction && coordinates && onViewAuction(coordinates.x, coordinates.y)}
                    >
                      View Auction
                    </button>
                  )}
                </div>
              )}

              {/* Create Auction button (only if not owned and not in auction) */}
              {!isOwned && !isForSale && auctionState === AuctionCreationState.IDLE && (
                <button
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900 flex items-center justify-center w-full"
                  onClick={handleCreateAuction}
                >
                  🔨 Create & Auction Tile
                </button>
              )}

              {/* Auction Creation Status */}
              {auctionState === AuctionCreationState.GENERATING_TILE && (
                <div className="bg-amber-700/80 border-2 border-amber-900 p-2 text-center">
                  <div className="animate-pulse text-amber-200">Generating tile...</div>
                </div>
              )}

              {/* Tile Generated, Show Auction Form */}
              {auctionState === AuctionCreationState.TILE_GENERATED && generatedTileId && (
                <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                  <h4 className="text-amber-100 mb-2">Tile Generated!</h4>
                  <p className="text-amber-200 mb-2">Now create an auction for this tile.</p>

                  <div className="mb-2">
                    <label className="block text-amber-200 mb-1">Auction Title</label>
                    <input
                      type="text"
                      className="w-full bg-amber-800 border-2 border-amber-900 p-1 text-amber-100"
                      value={auctionTitle}
                      onChange={(e) => setAuctionTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-amber-200 mb-1">Starting Price (coins)</label>
                    <input
                      type="number"
                      className="w-full bg-amber-800 border-2 border-amber-900 p-1 text-amber-100"
                      value={startingPrice}
                      min="1"
                      onChange={(e) => setStartingPrice(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-amber-200 mb-1">Duration (hours)</label>
                    <select
                      className="w-full bg-amber-800 border-2 border-amber-900 p-1 text-amber-100"
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value))}
                    >
                      <option value="1">1 hour</option>
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="72">72 hours</option>
                    </select>
                  </div>

                  <div className="flex justify-between gap-2">
                    <button
                      className="bg-red-700 hover:bg-red-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900"
                      onClick={resetAuctionCreation}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900"
                      onClick={handleCreateAuctionWithTile}
                    >
                      Create Auction
                    </button>
                  </div>
                </div>
              )}

              {/* Creating Auction Status */}
              {auctionState === AuctionCreationState.CREATING_AUCTION && (
                <div className="bg-amber-700/80 border-2 border-amber-900 p-2 text-center">
                  <div className="animate-pulse text-amber-200">Creating auction...</div>
                </div>
              )}

              {/* Auction Created Successfully */}
              {auctionState === AuctionCreationState.AUCTION_CREATED && auctionId && (
                <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                  <h4 className="text-amber-100 mb-1">Auction Created Successfully!</h4>
                  <p className="text-amber-200 mb-2">Your tile has been added to the auction house.</p>
                  <div className="flex justify-between gap-2">
                    <button
                      className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900"
                      onClick={resetAuctionCreation}
                    >
                      Done
                    </button>
                    <button
                      className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900"
                      onClick={viewCreatedAuction}
                    >
                      View Auction
                    </button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {auctionState === AuctionCreationState.ERROR && errorMessage && (
                <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                  <h4 className="text-red-400 mb-1">Cannot Create Auction</h4>
                  <p className="text-amber-200 mb-2">{errorMessage}</p>
                  <button
                    className="bg-amber-700 hover:bg-amber-600 text-amber-100 py-1 px-3 text-xxs border-2 border-amber-900"
                    onClick={resetAuctionCreation}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default TileInfoPanel;
