import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from 'react-hot-toast';
import auctionService from '@/services/auctionService';
import realtimeService from '@/services/realtimeService';
import { AuctionItem, Bid, AuctionStatus, AuctionType } from '@/types/auction';
import { EventTopic, EventType } from '@/services/realtimeService';
import { useAuth } from '@/context/AuthContext';
import AuctionTimer from '../AuctionTimer';

const Auction: React.FC = () => {
  const { user } = useAuth();
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'my-bids'>('active');

  // Fetch auctions on component mount
  useEffect(() => {
    fetchAuctions();
    
    // Subscribe to real-time auction updates
    realtimeService.subscribe(
      EventTopic.AUCTION,
      undefined,
      EventType.AUCTION_BID_PLACED,
      handleAuctionUpdate
    );
    
    realtimeService.subscribe(
      EventTopic.AUCTION,
      undefined,
      EventType.AUCTION_STARTED,
      handleAuctionUpdate
    );
    
    realtimeService.subscribe(
      EventTopic.AUCTION,
      undefined,
      EventType.AUCTION_ENDED,
      handleAuctionUpdate
    );
    
    // Cleanup subscriptions on unmount
    return () => {
      realtimeService.unsubscribe(EventTopic.AUCTION, undefined, EventType.AUCTION_BID_PLACED);
      realtimeService.unsubscribe(EventTopic.AUCTION, undefined, EventType.AUCTION_STARTED);
      realtimeService.unsubscribe(EventTopic.AUCTION, undefined, EventType.AUCTION_ENDED);
    };
  }, []);
  
  // Fetch auctions from the API
  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await auctionService.fetchAuctions();
      setAuctions(data);
    } catch (err: any) {
      console.error('Error fetching auctions:', err);
      setError(err.message || 'Failed to load auctions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle real-time auction updates
  const handleAuctionUpdate = (data: any) => {
    console.log('Auction update received:', data);
    
    // Show appropriate toast notification based on event type
    switch (data.type) {
      case EventType.AUCTION_STARTED:
        toast.success(`New auction started: ${data.data.title}`);
        break;
      case EventType.AUCTION_BID_PLACED:
        if (user && data.data.bidderId === user.id) {
          toast.success(`Your bid of ${data.data.bidAmount} has been placed!`);
        } else {
          toast.success(`New bid of ${data.data.bidAmount} placed on "${data.data.auctionTitle}"`);
        }
        break;
      case EventType.AUCTION_ENDED:
        if (user && data.data.winnerId === user.id) {
          toast.success(`Congratulations! You won the auction for "${data.data.title}"`);
        } else {
          toast.success(`Auction ended: "${data.data.title}"`);
        }
        break;
    }
    
    // Refresh the auctions list
    fetchAuctions();
    
    // If currently viewing this auction, refresh the details
    if (selectedAuction && data.auctionId === selectedAuction._id) {
      fetchAuctionDetails(data.auctionId);
    }
  };
  
  // Fetch details for a specific auction
  const fetchAuctionDetails = async (auctionId: string) => {
    try {
      const auction = await auctionService.fetchAuctionById(auctionId);
      setSelectedAuction(auction);
      setBidAmount(auction.currentPrice + (auction.minIncrement || 1));
    } catch (err: any) {
      console.error('Error fetching auction details:', err);
    }
  };

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

  const getTypeColor = (biomeType: string): string => {
    switch (biomeType?.toLowerCase()) {
      case "grassland":
      case "plains":
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

  const handleBid = async (auction: AuctionItem) => {
    if (!user) {
      setBidError('You must be logged in to place a bid');
      return;
    }
    
    try {
      setBidError(null);
      setBidSuccess(null);
      
      // Place bid through API
      const updatedAuction = await auctionService.placeBid(auction._id, bidAmount);
      
      // Emit bid placed event through socket
      if (realtimeService.isConnected()) {
        realtimeService['socket']?.emit('publish', {
          topic: EventTopic.AUCTION,
          event: {
            type: EventType.AUCTION_BID_PLACED,
            data: {
              auctionId: auction._id,
              auctionTitle: auction.title,
              bidAmount: bidAmount,
              bidderId: user.id,
              bidderName: user.username,
              timestamp: new Date().toISOString()
            }
          }
        });
      }
      
      // Update local state
      setSelectedAuction(updatedAuction);
      setBidSuccess('Bid placed successfully!');
      
      // Refresh auctions list
      fetchAuctions();
      
    } catch (err: any) {
      console.error('Error placing bid:', err);
      setBidError(err.message || 'Failed to place bid');
    }
  };

  const handleAuctionClick = async (auction: AuctionItem) => {
    try {
      // Fetch full auction details
      const fullAuction = await auctionService.fetchAuctionById(auction._id);
      setSelectedAuction(fullAuction);
      
      // Set initial bid amount to current price + minimum increment
      const minIncrement = fullAuction.minIncrement || 1;
      setBidAmount(fullAuction.currentPrice + minIncrement);
    } catch (err: any) {
      console.error('Error fetching auction details:', err);
      setError(err.message || 'Failed to load auction details');
    }
  };
  
  // Format currency
  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "0";
    return amount.toString();
  };
  
  // Check if user is the highest bidder
  const isUserHighestBidder = (auction: AuctionItem): boolean => {
    if (!user || !auction || !auction.bids || auction.bids.length === 0) return false;
    
    // Sort bids by amount (highest first)
    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    
    // Return true if the highest bid is from the current user
    return sortedBids[0].playerId === user.id;
  };
  
  // Get active auctions
  const getActiveAuctions = (): AuctionItem[] => {
    return auctions.filter(auction => 
      auction.status === AuctionStatus.IN_PROGRESS || 
      auction.status === AuctionStatus.SCHEDULED
    );
  };
  
  // Check if bidding is allowed for the current user
  const canPlaceBid = (auction: AuctionItem): boolean => {
    if (!user) return false;
    if (auction.status !== AuctionStatus.IN_PROGRESS) return false;
    if (isUserHighestBidder(auction)) return false;
    return true;
  };
  
  // Get main tile from auction
  const getMainTile = (auction: AuctionItem) => {
    return auction.tiles && auction.tiles.length > 0 ? auction.tiles[0] : null;
  };
  
  // Get location string for a tile
  const getTileLocation = (auction: AuctionItem): string => {
    const tile = getMainTile(auction);
    if (!tile) return "Unknown";
    if (typeof tile.x === 'undefined' || typeof tile.y === 'undefined') return "Unknown";
    return `(${tile.x}, ${tile.y})`;
  };

  // Get auctions user has bid on
  const getMyBidAuctions = (): AuctionItem[] => {
    if (!user) return [];
    return auctions.filter(auction => 
      auction.bids?.some(bid => bid.playerId === user.id)
    );
  };

  // Get user's highest bid for an auction
  const getMyHighestBid = (auction: AuctionItem): number | null => {
    if (!user || !auction.bids) return null;
    const myBids = auction.bids.filter(bid => bid.playerId === user.id);
    if (myBids.length === 0) return null;
    return Math.max(...myBids.map(bid => bid.amount));
  };

  // Get the current highest bid for an auction
  const getHighestBid = (auction: AuctionItem): number => {
    if (!auction.bids || auction.bids.length === 0) return auction.startingPrice || 0;
    return Math.max(...auction.bids.map(bid => bid.amount));
  };

  // Render the auction tabs
  const renderTabs = () => {
    return (
      <div className="flex gap-1 mb-3">
        <button
          className={`pixel-button text-xxs py-1 px-2 ${
            activeTab === 'active' ? 'bg-yellow-500' : 'bg-gray-300'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Auctions
        </button>
        <button
          className={`pixel-button text-xxs py-1 px-2 ${
            activeTab === 'my-bids' ? 'bg-yellow-500' : 'bg-gray-300'
          }`}
          onClick={() => setActiveTab('my-bids')}
        >
          My Bids
        </button>
      </div>
    );
  };

  // Render an auction card
  const renderAuctionCard = (auction: AuctionItem) => {
    const amIHighestBidder = isUserHighestBidder(auction);
    const myHighestBid = getMyHighestBid(auction);
    const currentHighestBid = getHighestBid(auction);

    return (
      <div
        key={auction._id}
        className="p-2 border-2 border-yellow-800 bg-yellow-100/50 cursor-pointer hover:bg-yellow-200/50 transition-colors relative"
        onClick={() => handleAuctionClick(auction)}
      >
        <div className="flex items-center gap-2">
          {getMainTile(auction) && (
            <div
              className={`w-8 h-8 border-1 ${getRarityColor(
                auction.status
              )}`}
            >
              <div
                className={`w-full h-full ${getTypeColor(
                  getMainTile(auction)?.biome || ""
                )} flex items-center justify-center`}
              >
                <span className="text-yellow-900 text-xxs">
                  {getMainTile(auction)?.biome?.charAt(0) || "L"}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <div className="text-yellow-900 font-bold">{auction.title}</div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-800 text-xxs">
                {auction.currentPrice}
              </span>
              <span className="text-yellow-800 text-xxs">
                <AuctionTimer endTime={auction.endTime} />
              </span>
            </div>
            
            {myHighestBid && (
              <div className="mt-1 flex justify-between items-center text-xxs">
                <span className="text-gray-600">Your bid: {myHighestBid}</span>
                {amIHighestBidder ? (
                  <span className="text-green-600 font-bold">Highest Bidder!</span>
                ) : (
                  <span className="text-red-600">Outbid by {currentHighestBid - myHighestBid}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {amIHighestBidder && (
          <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
            <div className="bg-green-500 text-white text-xxs px-2 py-1 rounded-full">
              ★
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update the bidding panel render function
  const renderBiddingPanel = () => {
    if (!selectedAuction) return null;
    
    const amIHighestBidder = isUserHighestBidder(selectedAuction);
    
    // Don't render the bidding panel at all if user is highest bidder
    if (amIHighestBidder) {
      return (
        <div className="bg-green-100 border border-green-300 p-2 rounded text-center mb-3">
          <div className="text-green-600 font-bold text-xxs mb-1">
            🏆 You are the highest bidder!
          </div>
          <div className="text-green-500 text-xxs">
            Current bid: {selectedAuction.currentPrice}
          </div>
          <button
            className="pixel-button text-xxs py-1 px-2 mt-2"
            onClick={() => setSelectedAuction(null)}
          >
            Back to Auctions
          </button>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-3">
          <div className="text-center text-xxs mb-1">Place Your Bid</div>
          <div className="flex items-center justify-between">
            <button
              className="pixel-button text-xxs w-6 h-6 p-0 flex items-center justify-center"
              onClick={() =>
                setBidAmount((prev) =>
                  Math.max(selectedAuction.currentPrice + (selectedAuction.minIncrement || 1), prev - 25)
                )
              }
            >
              -
            </button>
            <div className="pixel-panel flex-1 mx-2 text-center p-1 text-xxs">
              {bidAmount}
            </div>
            <button
              className="pixel-button text-xxs w-6 h-6 p-0 flex items-center justify-center"
              onClick={() => setBidAmount((prev) => prev + 25)}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <button
            className="pixel-button text-xxs py-1 px-2 bg-red-500 text-yellow-100"
            onClick={() => setSelectedAuction(null)}
          >
            Cancel
          </button>
          <button
            className={`pixel-button text-xxs py-1 px-2 ${
              !canPlaceBid(selectedAuction) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleBid(selectedAuction)}
            disabled={!canPlaceBid(selectedAuction)}
          >
            Place Bid
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="font-pixel text-xs">
      <h1 className="pixel-heading text-sm mb-3">Auction House</h1>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-pulse">Loading auctions...</div>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-center py-2 px-2 border border-red-300 bg-red-50 mb-3">
          {error}
        </div>
      )}

      {selectedAuction && bidSuccess ? (
        <div className="pixel-panel p-3">
          <div className="text-center">
            <h2 className="text-sm mb-2">{selectedAuction.title}</h2>
            <div className="text-green-500 mb-4">{bidSuccess}</div>
            <button
              className="pixel-button text-xxs py-1 px-2"
              onClick={() => setSelectedAuction(null)}
            >
              Back to Auctions
            </button>
          </div>
        </div>
      ) : selectedAuction ? (
        <div className="pixel-panel p-3">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs text-yellow-900 font-bold">
              {selectedAuction.title}
            </h2>
            <button
              className="bg-yellow-800 text-yellow-100 w-5 h-5 flex items-center justify-center"
              onClick={() => setSelectedAuction(null)}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            {getMainTile(selectedAuction) && (
            <div
              className={`w-24 h-24 mx-auto sm:mx-0 border-2 ${getRarityColor(
                  selectedAuction.status
              )}`}
            >
              <div
                className={`w-full h-full ${getTypeColor(
                    getMainTile(selectedAuction)?.biome || ""
                )} flex items-center justify-center`}
              >
                <span className="text-yellow-900 text-xxs">
                    {getMainTile(selectedAuction)?.biome?.charAt(0) || "L"}
                </span>
              </div>
            </div>
            )}

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-1 text-xxs">
                <div>Type:</div>
                <div className="text-yellow-900">
                  {getMainTile(selectedAuction)?.biome || "Land"}
                </div>

                <div>Location:</div>
                <div className="text-yellow-900">
                  {getTileLocation(selectedAuction)}
                </div>

                <div>Current Bid:</div>
                <div className="text-yellow-900">
                  {selectedAuction.currentPrice}
                </div>

                <div>Time Left:</div>
                <div className="text-yellow-900">
                  <AuctionTimer endTime={selectedAuction.endTime} />
                </div>

                <div>Bids:</div>
                <div className="text-yellow-900">{selectedAuction.bids?.length || 0}</div>
                
                <div>Status:</div>
                <div className="text-yellow-900">{selectedAuction.status}</div>
              </div>
            </div>
          </div>

          {bidError && (
            <div className="text-red-500 text-center py-1 px-2 border border-red-300 bg-red-50 mb-3 text-xxs">
              {bidError}
            </div>
          )}

          {renderBiddingPanel()}
          
          {selectedAuction.status !== AuctionStatus.IN_PROGRESS && (
            <div className="text-center py-2">
              <button
                className="pixel-button text-xxs py-1 px-2"
                onClick={() => setSelectedAuction(null)}
              >
                Back to Auctions
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {renderTabs()}
          
          {!isLoading && activeTab === 'active' && getActiveAuctions().length === 0 && (
            <div className="text-center py-4">
              No active auctions available.
            </div>
          )}
          
          {!isLoading && activeTab === 'my-bids' && getMyBidAuctions().length === 0 && (
            <div className="text-center py-4">
              You haven't placed any bids yet.
            </div>
          )}
          
          <div className="space-y-2">
            {activeTab === 'active' 
              ? getActiveAuctions().map(auction => renderAuctionCard(auction))
              : getMyBidAuctions().map(auction => renderAuctionCard(auction))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Auction;
