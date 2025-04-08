'use client';

import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';
import CreateAuctionButton from '@/app/components/admin/CreateAuctionButton';
import RandomTilesAuctionButton from '@/app/components/admin/RandomTilesAuctionButton';
import auctionService, { AuctionEvent } from '@/services/auctionService';
import { AuctionItem, Bid, AuctionStatus } from '@/types/auction';
import AuctionCard from '@/app/components/auction/AuctionCard';
import { useAuth } from '@/context/AuthContext';
import { EventType, EventTopic, AuctionBidPlacedEvent } from '@/types/realtime';
import realtimeService from '@/services/realtimeService';

/**
 * Admin page for auction management
 */
export default function AuctionsAdminPage() {
  // We'd typically get this from the WorldMap component
  // For now, simulate it with an empty array
  const [selectedTiles, setSelectedTiles] = useState<Array<{ x: number; y: number; info: string }>>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'myBids'>('active');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Auction Management</h1>
        <div className="space-x-4">
          <CreateAuctionButton selectedTiles={selectedTiles} />
          <RandomTilesAuctionButton />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'active' ? 'bg-blue-100 border-b-2 border-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('active')}
          >
            Active Auctions
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'myBids' ? 'bg-blue-100 border-b-2 border-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('myBids')}
          >
            My Bids
          </button>
        </div>
        
        <div className="p-6">
          <Suspense fallback={<div>Loading auctions...</div>}>
            {activeTab === 'active' ? <AuctionsList /> : <MyBidsList />}
          </Suspense>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="space-y-2">
          <p>To create an auction with selected tiles:</p>
          <ol className="list-decimal list-inside pl-4 space-y-1">
            <li>Navigate to the World Map</li>
            <li>Click on tiles you want to auction (hold shift to select multiple)</li>
            <li>Return to this page and click "Create Auction with Selected Tiles"</li>
          </ol>
          
          <p className="mt-4">Or use the "Create Auction with Random Tiles" button to generate an auction with 10 random tiles.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Component to display a list of active auctions
 */
function AuctionsList() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    let mounted = true;
    
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const data = await auctionService.getActiveAuctions();
        if (mounted) {
          setAuctions(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Only fetch auctions once on mount
    fetchAuctions();
    
    // Setup socket subscription for real-time updates
    const handleAuctionUpdate = (event: AuctionEvent) => {
      if (event.type === EventType.AUCTION_BID_PLACED) {
        const { auctionId, playerId, bidAmount, timestamp } = event.data;
        
        // Create a new bid object
        const newBid: Bid = {
          playerId,
          amount: bidAmount,
          timestamp: new Date(timestamp)
        };
        
        // Update the auctions state without re-fetching
        setAuctions(prev => {
          // Check if this auction exists in our list
          const auctionExists = prev.some(a => a._id === auctionId);
          
          if (!auctionExists) {
            // If not in our list, don't modify the state
            return prev;
          }
          
          // Update the auction in our list
          return prev.map(auction => 
            auction._id === auctionId ? {
              ...auction,
              currentPrice: bidAmount,
              bids: [...auction.bids, newBid]
            } : auction
          );
        });
      } else if (event.type === EventType.AUCTION_CREATED) {
        // Only fetch the new auction, not all auctions
        auctionService.getAuction(event.data.auctionId)
          .then(newAuction => {
            if (mounted) {
              setAuctions(prev => [...prev, newAuction]);
            }
          })
          .catch(error => {
            console.error('Failed to fetch new auction:', error);
          });
      } else if (event.type === EventType.AUCTION_ENDED) {
        // Remove ended auctions from state without re-fetching
        setAuctions(prev => prev.filter(auction => 
          auction._id !== event.data.auctionId
        ));
      }
    };
    
    // Subscribe to all auction events once
    auctionService.subscribeToAllAuctions(handleAuctionUpdate);
    
    // Cleanup function
    return () => {
      mounted = false;
      // Unsubscribe to prevent memory leaks
      auctionService.unsubscribeFromAllAuctions();
    };
  }, []); // Empty dependency array to run only once on mount
  
  if (loading) {
    return <div>Loading active auctions...</div>;
  }
  
  if (auctions.length === 0) {
    return (
      <div className="text-gray-500">
        No active auctions. Click one of the Create Auction buttons to start a new auction.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {auctions.map((auction) => (
        <AuctionCard key={auction._id} auction={auction} />
      ))}
    </div>
  );
}

/**
 * Component to display a list of auctions the user has bid on
 */
function MyBidsList() {
  const [myBids, setMyBids] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    let mounted = true;
    
    const fetchMyBids = async () => {
      try {
        setLoading(true);
        const data = await auctionService.getMyBids();
        if (mounted) {
          setMyBids(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch my bids:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Only fetch my bids once on mount if user is logged in
    if (user) {
      fetchMyBids();
    } else {
      setLoading(false);
    }
    
    // Setup socket subscription for real-time updates
    const handleAuctionUpdate = (event: AuctionEvent) => {
      if (event.type === EventType.AUCTION_BID_PLACED) {
        const { auctionId, playerId, bidAmount, timestamp } = event.data;
        
        // Only update if it's the user's bid
        if (user && playerId === user.id) {
          // Create a new bid object
          const newBid: Bid = {
            playerId,
            amount: bidAmount,
            timestamp: new Date(timestamp)
          };
          
          // Check if this auction is already in my bids list
          setMyBids(prev => {
            const auctionExists = prev.some(auction => auction._id === auctionId);
            
            if (auctionExists) {
              // Update existing auction
              return prev.map(auction => 
                auction._id === auctionId ? {
                  ...auction,
                  currentPrice: bidAmount,
                  bids: [...auction.bids, newBid]
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
                      bids: [...auctionDetails.bids, newBid]
                    }]);
                  }
                })
                .catch(error => console.error('Failed to fetch auction details:', error));
              
              // Return unchanged state for now, the async fetch will update it
              return prev;
            }
          });
        } else {
          // Someone else's bid, update any matching auctions in my list
          setMyBids(prev => {
            const auctionExists = prev.some(auction => auction._id === auctionId);
            
            if (auctionExists) {
              // Create a new bid object
              const newBid: Bid = {
                playerId,
                amount: bidAmount,
                timestamp: new Date(timestamp)
              };
              
              // Update the auction in the list
              return prev.map(auction => 
                auction._id === auctionId ? {
                  ...auction,
                  currentPrice: bidAmount,
                  bids: [...auction.bids, newBid]
                } : auction
              );
            }
            
            // If auction not in my list, no change needed
            return prev;
          });
        }
      } else if (event.type === EventType.AUCTION_ENDED) {
        // Update auction status when ended
        setMyBids(prev => prev.map(auction => 
          auction._id === event.data.auctionId ? {
            ...auction,
            status: AuctionStatus.COMPLETED
          } : auction
        ));
      }
    };
    
    // Subscribe to all auction events once
    auctionService.subscribeToAllAuctions(handleAuctionUpdate);
    
    // Cleanup function
    return () => {
      mounted = false;
      // Unsubscribe to prevent memory leaks
      auctionService.unsubscribeFromAllAuctions();
    };
  }, [user]); // Only depend on user to avoid repeated fetches
  
  if (loading) {
    return <div>Loading your bids...</div>;
  }
  
  if (myBids.length === 0) {
    return (
      <div className="text-gray-500">
        You haven't placed any bids yet. Browse the active auctions to start bidding.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {myBids.map((auction) => (
        <AuctionCard key={auction._id} auction={auction} />
      ))}
    </div>
  );
} 