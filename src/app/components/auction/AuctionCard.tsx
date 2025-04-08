import React from 'react';
import { AuctionItem } from '@/types/auction';
import AuctionTimer from '@/app/components/UI/AuctionTimer';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface AuctionCardProps {
  auction: AuctionItem;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
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
    
    // Otherwise return player ID
    return `Player ${highestBidderId.substring(0, 5)}...`;
  };
  
  // Get tile type color
  const getTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case "grassland":
        return "bg-green-400";
      case "mountain":
        return "bg-gray-400";
      case "desert":
        return "bg-yellow-300";
      case "coast":
        return "bg-blue-300";
      case "special":
        return "bg-purple-300";
      default:
        return "bg-gray-300";
    }
  };
  
  // Get rarity color
  const getRarityColor = (rarity: string): string => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "bg-gray-400 border-gray-600";
      case "uncommon":
        return "bg-green-500 border-green-700";
      case "rare":
        return "bg-blue-500 border-blue-700";
      case "epic":
        return "bg-purple-500 border-purple-700";
      case "legendary":
        return "bg-yellow-500 border-yellow-700";
      default:
        return "bg-gray-400 border-gray-600";
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div 
            className={`w-12 h-12 rounded-md border-2 ${
              getRarityColor(auction.tiles[0]?.biome || "common")
            }`}
          >
            <div
              className={`w-full h-full ${
                getTypeColor(auction.tiles[0]?.type || "")
              } flex items-center justify-center rounded-sm`}
            >
              <span className="text-gray-900 text-xs font-bold">
                {auction.tiles[0]?.type?.charAt(0) || "L"}
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
                <AuctionTimer endTime={auction.endTime} />
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
              <div>{auction.tiles[0]?.type || "Land"}</div>
              
              <div>Location:</div>
              <div>
                {auction.tiles[0] ? 
                  `(${auction.tiles[0].x}, ${auction.tiles[0].y})` : 
                  "Unknown"}
              </div>
              
              <div>Bids:</div>
              <div>{auction.bids.length}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between">
          <Link 
            href={`/world?x=${auction.tiles[0]?.x || 0}&y=${auction.tiles[0]?.y || 0}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View on Map
          </Link>
          
          <Link 
            href="#" 
            className={`${
              isUserHighestBidder() 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800'
            } text-sm`}
            onClick={(e) => {
              if (isUserHighestBidder()) {
                e.preventDefault();
              }
            }}
          >
            {isUserHighestBidder() ? 'Currently Highest Bidder' : 'Place Bid'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 