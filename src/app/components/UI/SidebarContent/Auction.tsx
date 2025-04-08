import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import auctionService, { AuctionEvent } from "@/services/auctionService";
import { AuctionItem, AuctionStatus, AuctionType, Bid } from "@/types/auction";
import AuctionTimer from "../AuctionTimer";
import { EventType, EventTopic, AuctionBidPlacedEvent } from "@/types/realtime";
import notificationService from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";
import realtimeService from "@/services/realtimeService";

const Auction: React.FC = () => {
  const { user } = useAuth();
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [myBids, setMyBids] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchFlag, setFetchFlag] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'auctions' | 'myBids'>('auctions');
  
  // Add a ref to track last bid time
  const lastBidEventRef = useRef<Date | null>(null);

  // Fetch auctions on component mount or when fetchFlag changes
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active auctions - ONCE only
        const activeAuctions = await auctionService.getActiveAuctions();
        
        if (mounted) {
          setAuctions(activeAuctions);
          
          // If user is logged in, fetch their bids - ONCE only
          if (user) {
            const userBids = await auctionService.getMyBids();
            setMyBids(userBids);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch auction data:", error);
        if (mounted) {
          setError("Failed to fetch auction data. Please try again later.");
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Single subscription to all auction events
    const handleAuctionUpdate = (event: AuctionEvent) => {
      if (event.type === EventType.AUCTION_CREATED) {
        if (!mounted) return;
        
        // Fetch only the new auction, not all auctions
        auctionService.getAuction(event.data.auctionId)
          .then(newAuction => {
            if (mounted) {
              setAuctions(prev => [...prev, newAuction]);
            }
          })
          .catch(error => {
            console.error('Failed to fetch new auction:', error);
          });
      } else if (event.type === EventType.AUCTION_BID_PLACED) {
        if (!mounted) return;
        
        const { auctionId, playerId, bidAmount, timestamp } = event.data;
        
        // Create a new bid object
        const updatedBid: Bid = {
          playerId,
          amount: bidAmount,
          timestamp: new Date(timestamp)
        };
        
        // Update auctions list without re-fetching
        setAuctions(prev => prev.map(auction => 
          auction._id === auctionId ? {
            ...auction, 
            currentPrice: bidAmount,
            bids: [...auction.bids, updatedBid]
          } : auction
        ));
        
        // Update my bids list if it's my bid
        if (user && playerId === user.id) {
          // Check if auction is already in my bids
          setMyBids(prev => {
            const bidExists = prev.some(bid => bid._id === auctionId);
            
            if (bidExists) {
              return prev.map(auction => 
                auction._id === auctionId ? {
                  ...auction,
                  currentPrice: bidAmount,
                  bids: [...auction.bids, updatedBid]
                } : auction
              );
            } else {
              // If this is a new auction I'm bidding on, fetch just that auction
              auctionService.getAuction(auctionId)
                .then(auctionDetails => {
                  if (mounted) {
                    setMyBids(current => [...current, {
                      ...auctionDetails,
                      currentPrice: bidAmount,
                      bids: [...auctionDetails.bids, updatedBid]
                    }]);
                  }
                })
                .catch(error => console.error('Failed to fetch auction details:', error));
              
              // Return unchanged state for now
              return prev;
            }
          });
        }
        
        // Show notifications based on who placed the bid
        if (user && playerId === user.id) {
          // Current user placed bid
          notificationService.showSuccess(`Bid placed: ${bidAmount} coins`);
        } else {
          // Check if the user had the previous highest bid
          const currentAuction = auctions.find(a => a._id === auctionId);
          if (currentAuction && user) {
            const currentUserBids = currentAuction.bids.filter(bid => bid.playerId === user.id);
            if (currentUserBids.length > 0) {
              // Get the highest bid from the current user
              const highestBid = Math.max(...currentUserBids.map(bid => bid.amount));
              
              // If the current user had the highest bid before this new bid, they've been outbid
              if (highestBid === event.data.previousPrice) {
                notificationService.showWarning(`You've been outbid on "${currentAuction.title}"!`);
              }
            }
          }
        }
      } else if (event.type === EventType.AUCTION_ENDED) {
        if (!mounted) return;
        
        const { auctionId } = event.data;
        
        // Remove ended auction from lists
        setAuctions(prev => prev.filter(auction => auction._id !== auctionId));
        setMyBids(prev => prev.filter(auction => auction._id !== auctionId));
        
        // Clear selection if the ended auction was selected
        if (selectedAuction && selectedAuction._id === auctionId) {
          setSelectedAuction(null);
        }
        
        // Show relevant notifications
        if (user && event.data.winningBid && event.data.winningBid.playerId === user.id) {
          notificationService.showSuccess(`You won the auction!`);
        }
      }
    };
    
    // Single subscription to all auction events
    auctionService.subscribeToAllAuctions(handleAuctionUpdate);
    
    // Setup custom event listener for local bid events as a fallback
    const handleLocalBidEvent = (event: CustomEvent<AuctionEvent>) => {
      if (!event.detail || event.detail.type !== EventType.AUCTION_BID_PLACED) return;
      
      console.log('Received local bid event:', event.detail);
      lastBidEventRef.current = new Date();
      
      // Process the event the same way we handle WebSocket events
      handleAuctionUpdate(event.detail);
    };
    
    // Add the event listener
    document.addEventListener('auction:bid-placed', handleLocalBidEvent as EventListener);
    
    return () => {
      mounted = false;
      auctionService.unsubscribeFromAllAuctions();
      document.removeEventListener('auction:bid-placed', handleLocalBidEvent as EventListener);
    };
  }, [user, fetchFlag]); // Only run when user or fetchFlag changes

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
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

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "grassland":
      case "Grassland":
        return "bg-green-400";
      case "mountain":
      case "Mountain":
        return "bg-gray-400";
      case "desert":
      case "Desert":
        return "bg-yellow-300";
      case "coast":
      case "Coast":
        return "bg-blue-300";
      case "special":
      case "Special":
        return "bg-purple-300";
      default:
        return "bg-gray-300";
    }
  };

  // Check if user is the highest bidder
  const isUserHighestBidder = (auction: AuctionItem): boolean => {
    if (!user || auction.bids.length === 0) return false;
    
    // Sort bids by amount (highest first)
    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    
    // Return true if the highest bid is from the current user
    return sortedBids[0].playerId === user.id;
  };

  const handleBid = async (auction: AuctionItem) => {
    try {
      setLoading(true);
      console.log(`Placing bid of ${bidAmount} on auction ${auction._id}`);
      
      const response = await auctionService.placeBid(auction._id, bidAmount);
      console.log(`Bid placed successfully:`, response);
      
      if (response && user) {
        // Create a local bid event as a fallback if WebSocket doesn't fire
        const newBid: Bid = {
          playerId: user.id,
          amount: bidAmount,
          timestamp: new Date()
        };
        
        // Update local state immediately without waiting for WebSocket
        setAuctions(prev => prev.map(a => 
          a._id === auction._id ? {
            ...a,
            currentPrice: bidAmount,
            bids: [...a.bids, newBid]
          } : a
        ));
        
        // Add this auction to my bids if it's not already there
        setMyBids(prev => {
          // Check if this auction is already in my bids
          const bidExists = prev.some(b => b._id === auction._id);
          
          if (bidExists) {
            return prev.map(a => 
              a._id === auction._id ? {
                ...a,
                currentPrice: bidAmount,
                bids: [...a.bids, newBid]
              } : a
            );
          } else {
            // If not, add it
            return [...prev, {
              ...auction,
              currentPrice: bidAmount,
              bids: [...auction.bids, newBid]
            }];
          }
        });
      }
      
      // Success notification will be triggered by WebSocket event
      setSelectedAuction(null);
    } catch (err: any) {
      setError(err.message || 'Failed to place bid. Please try again.');
      notificationService.showError(err.message || 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuctionClick = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    // Set bid amount to just 1 coin higher than current price
    setBidAmount(auction.currentPrice + 1);
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} coins`;
  };

  // Handle auction end
  const handleAuctionEnd = (auctionId: string) => {
    setAuctions(prev => prev.filter(auction => auction._id !== auctionId));
    setMyBids(prev => prev.filter(auction => auction._id !== auctionId));
    
    if (selectedAuction && selectedAuction._id === auctionId) {
      setSelectedAuction(null);
    }
    
    const auction = auctions.find(a => a._id === auctionId);
    if (auction) {
      notificationService.showNotification(`Auction ended: ${auction.title}`);
    }
  };

  // Get highest bidder username
  const getHighestBidderUsername = (auction: AuctionItem): string => {
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

  // Render loading state
  if (loading && auctions.length === 0 && myBids.length === 0) {
    return (
      <div className="font-pixel text-xs">
        <h1 className="pixel-heading text-sm mb-3">Auction House</h1>
        <div className="pixel-panel p-3 flex justify-center items-center h-32">
          <div className="animate-pulse text-center">
            <p>Loading auctions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && auctions.length === 0 && myBids.length === 0) {
    return (
      <div className="font-pixel text-xs">
        <h1 className="pixel-heading text-sm mb-3">Auction House</h1>
        <div className="pixel-panel p-3">
          <div className="text-center text-red-500 mb-2">{error}</div>
          <button 
            className="pixel-button text-xxs py-1 px-2 mx-auto block"
            onClick={() => {
              setFetchFlag(prev => prev + 1);
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-pixel text-xs" data-auction-subscription="true">
      <h1 className="pixel-heading text-sm mb-3">Auction House</h1>
      
      {/* Show error message if there's an error but we still have auctions to display */}
      {error && (
        <div className="pixel-panel p-2 mb-2 bg-red-100 border border-red-500">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      )}

      {selectedAuction ? (
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
            <div
              className={`w-24 h-24 mx-auto sm:mx-0 border-2 ${
                getRarityColor(selectedAuction.tiles[0]?.biome || "common")
              }`}
            >
              <div
                className={`w-full h-full ${
                  getTypeColor(selectedAuction.tiles[0]?.type || "")
                } flex items-center justify-center`}
              >
                <span className="text-yellow-900 text-xxs">
                  {selectedAuction.tiles[0]?.type || "Land"}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-1 text-xxs">
                <div>Type:</div>
                <div className="text-yellow-900">
                  {selectedAuction.tiles[0]?.type || "Land"}
                </div>

                <div>Location:</div>
                <div className="text-yellow-900">
                  {selectedAuction.tiles[0] ? 
                    `(${selectedAuction.tiles[0].x}, ${selectedAuction.tiles[0].y})` : 
                    "Unknown"}
                </div>

                <div>Current Bid:</div>
                <div className="text-yellow-900">
                  {formatCurrency(selectedAuction.currentPrice)}
                </div>

                <div>Highest Bidder:</div>
                <div className="text-yellow-900">
                  {getHighestBidderUsername(selectedAuction)}
                </div>

                <div>Time Left:</div>
                <div className="text-yellow-900">
                  <AuctionTimer 
                    endTime={selectedAuction.endTime} 
                    onEnd={() => handleAuctionEnd(selectedAuction._id)}
                  />
                </div>

                <div>Bids:</div>
                <div className="text-yellow-900">{selectedAuction.bids.length}</div>
              </div>
            </div>
          </div>

          {!isUserHighestBidder(selectedAuction) ? (
            <>
              <div className="mb-3">
                <div className="text-center text-xxs mb-1">Place Your Bid</div>
                <div className="flex items-center justify-between">
                  <button
                    className="pixel-button text-xxs w-6 h-6 p-0 flex items-center justify-center"
                    onClick={() =>
                      setBidAmount((prev) =>
                        Math.max(
                          selectedAuction.currentPrice + 1, 
                          prev - 1
                        )
                      )
                    }
                    disabled={loading}
                  >
                    -
                  </button>
                  <div className="pixel-panel flex-1 mx-2 text-center p-1 text-xxs">
                    {formatCurrency(bidAmount)}
                  </div>
                  <button
                    className="pixel-button text-xxs w-6 h-6 p-0 flex items-center justify-center"
                    onClick={() => setBidAmount((prev) => prev + 1)}
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  className="pixel-button text-xxs py-1 px-2 bg-red-500 text-yellow-100"
                  onClick={() => setSelectedAuction(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className={`pixel-button text-xxs py-1 px-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleBid(selectedAuction)}
                  disabled={loading || bidAmount <= selectedAuction.currentPrice}
                >
                  {loading ? 'Processing...' : 'Place Bid'}
                </button>
              </div>
            </>
          ) : (
            <div className="pixel-panel p-2 bg-green-100 text-center mt-2 mb-2">
              <p className="text-green-700 text-xxs">You are currently the highest bidder!</p>
              <button
                className="pixel-button text-xxs py-1 px-2 mt-2"
                onClick={() => setSelectedAuction(null)}
              >
                Back to Auctions
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Tab navigation */}
          <div className="flex border-b border-yellow-800 mb-3">
            <button
              className={`px-3 py-1 ${activeTab === 'auctions' ? 'bg-yellow-200 font-bold' : 'bg-yellow-100'}`}
              onClick={() => setActiveTab('auctions')}
            >
              Auctions
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'myBids' ? 'bg-yellow-200 font-bold' : 'bg-yellow-100'}`}
              onClick={() => setActiveTab('myBids')}
            >
              My Bids
            </button>
          </div>

          {activeTab === 'auctions' && auctions.length === 0 ? (
            <div className="pixel-panel p-3 text-center">
              <p>No active auctions found.</p>
              <p className="mt-2 text-xxs">Check back later for new auctions.</p>
            </div>
          ) : activeTab === 'myBids' && myBids.length === 0 ? (
            <div className="pixel-panel p-3 text-center">
              <p>You haven't placed any bids yet.</p>
              <p className="mt-2 text-xxs">Place bids on auctions to see them here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(activeTab === 'auctions' ? auctions : myBids).map((auction) => (
                <div
                  key={auction._id}
                  className="p-2 border-2 border-yellow-800 bg-yellow-100/50 cursor-pointer hover:bg-yellow-200/50 transition-colors"
                  onClick={() => handleAuctionClick(auction)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 border-1 ${
                        getRarityColor(auction.tiles[0]?.biome || "common")
                      }`}
                    >
                      <div
                        className={`w-full h-full ${
                          getTypeColor(auction.tiles[0]?.type || "")
                        } flex items-center justify-center`}
                      >
                        <span className="text-yellow-900 text-xxs">
                          {auction.tiles[0]?.type?.charAt(0) || "L"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="text-yellow-900 text-xs font-bold">
                        {auction.title}
                      </div>
                      <div className="flex justify-between mt-1 text-xxs">
                        <div>
                          Current: {formatCurrency(auction.currentPrice)}
                        </div>
                        <div>
                          <AuctionTimer endTime={auction.endTime} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xxs">
                        <div>
                          Highest: {getHighestBidderUsername(auction)}
                        </div>
                        {isUserHighestBidder(auction) && (
                          <div className="text-green-700">You're winning!</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Auction;
