import React from 'react';
import { AuctionItem, AuctionStatus } from '@/types/auction';
import AuctionTimer from '@/app/components/UI/AuctionTimer';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface AuctionCardProps {
  auction: AuctionItem;
  onZoomToTile?: (x: number, y: number) => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onZoomToTile }) => {
  const { user } = useAuth();
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} coins`;
  };
  
  // Check if user is the highest bidder
  const isUserHighestBidder = (): boolean => {
    if (!user || auction.bids.length === 0) return false;
    
    // Sort bids by amount (highest first)
    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    
    // Return true if the highest bid is from the current user
    return sortedBids[0].playerId === user.id;
  };
  
  // Get highest bidder username
  const getHighestBidderUsername = (): string => {
    if (auction.bids.length === 0) return "No bids yet";
    
    // Sort bids by amount (highest first)
    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    const highestBidderId = sortedBids[0].playerId;
    
    // Indicate if it's the current user
    if (user && highestBidderId === user.id) {
      return "You";
    }
    
    // Otherwise return username or truncated ID
    const bidderName = sortedBids[0].playerName;
    return bidderName || `Player ${highestBidderId.substring(0, 5)}...`;
  };
  
  // Get tile type color
  const getTypeColor = (biomeType: string): string => {
    switch (biomeType?.toLowerCase()) {
      case "grassland":
        return "bg-green-400";
      case "mountains":
      case "hills":
        return "bg-gray-400";
      case "desert":
      case "savanna":
        return "bg-yellow-300";
      case "ocean":
      case "shallow_water":
        return "bg-blue-300";
      case "forest":
      case "taiga":
        return "bg-green-700";
      case "snow":
      case "tundra":
        return "bg-gray-100";
      case "rainforest":
        return "bg-green-500";
      case "volcanic":
        return "bg-red-700";
      case "marsh":
      case "swamp":
        return "bg-emerald-800";
      case "beach":
        return "bg-yellow-200";
      default:
        return "bg-gray-300";
    }
  };
  
  // Get rarity color (based on auction status)
  const getRarityColor = (status: AuctionStatus): string => {
    switch (status) {
      case AuctionStatus.SCHEDULED:
        return "bg-blue-500 border-blue-700";
      case AuctionStatus.IN_PROGRESS:
        return "bg-green-500 border-green-700";
      case AuctionStatus.COMPLETED:
        return "bg-gray-400 border-gray-600";
      case AuctionStatus.FAILED:
        return "bg-red-500 border-red-700";
      case AuctionStatus.CANCELLED:
        return "bg-yellow-500 border-yellow-700";
      default:
        return "bg-gray-400 border-gray-600";
    }
  };
  
  // Get auction status text
  const getStatusText = (status: AuctionStatus): string => {
    switch (status) {
      case AuctionStatus.SCHEDULED:
        return "Scheduled";
      case AuctionStatus.IN_PROGRESS:
        return "Active";
      case AuctionStatus.COMPLETED:
        return "Completed";
      case AuctionStatus.FAILED:
        return "Failed";
      case AuctionStatus.CANCELLED:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };
  
  // Check if auction is still active
  const isActive = (): boolean => {
    return auction.status === AuctionStatus.IN_PROGRESS || 
           auction.status === AuctionStatus.SCHEDULED;
  };
  
  // Get first tile from the auction
  const getMainTile = () => {
    return auction.tiles && auction.tiles.length > 0 ? auction.tiles[0] : null;
  };
  
  const mainTile = getMainTile();
  
  // Handle zoom to tile click
  const handleZoomToTile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mainTile && onZoomToTile) {
      onZoomToTile(mainTile.x, mainTile.y);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div 
            className={`w-12 h-12 rounded-md border-2 ${
              getRarityColor(auction.status)
            }`}
          >
            <div
              className={`w-full h-full ${
                getTypeColor(mainTile?.biome || "")
              } flex items-center justify-center rounded-sm`}
            >
              <span className="text-gray-900 text-xs font-bold">
                {mainTile?.biome?.charAt(0) || "L"}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{auction.title}</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">
                Current: {formatCurrency(auction.currentPrice)}
              </span>
              <span className="text-sm">
                {isActive() ? (
                  <AuctionTimer endTime={auction.endTime} />
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-gray-200">
                    {getStatusText(auction.status)}
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Highest: {getHighestBidderUsername()}
              </span>
              {isUserHighestBidder() && (
                <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                  You're winning!
                </span>
              )}
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500">
              <div>Type:</div>
              <div>{mainTile?.biome || "Land"}</div>
              
              <div>Location:</div>
              <div>
                {mainTile ? 
                  `(${mainTile.x}, ${mainTile.y})` : 
                  "Unknown"}
              </div>
              
              <div>Bids:</div>
              <div>{auction.bids.length}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {mainTile && onZoomToTile && (
              <button
                onClick={handleZoomToTile}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Go to Tile
              </button>
            )}
            <Link 
              href={`/world?x=${mainTile?.x || 0}&y=${mainTile?.y || 0}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View on Map
            </Link>
          </div>
          
          <Link 
            href={isActive() ? `/auctions/${auction._id}` : '#'} 
            className={`${
              !isActive() || isUserHighestBidder() 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800'
            } text-sm`}
            onClick={(e) => {
              if (!isActive() || isUserHighestBidder()) {
                e.preventDefault();
              }
            }}
          >
            {!isActive() 
              ? 'Auction Ended' 
              : isUserHighestBidder() 
                ? 'Currently Highest Bidder' 
                : 'Place Bid'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 