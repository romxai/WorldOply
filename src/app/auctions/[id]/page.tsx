'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import auctionService from '@/services/auctionService';
import { AuctionItem, AuctionStatus } from '@/types/auction';
import AuctionTimer from '@/app/components/UI/AuctionTimer';
import BidForm from '@/app/components/UI/BidForm';
import { useAuth } from '@/context/AuthContext';
import AuthButton from '@/app/components/UI/AuthButton';
import ConnectionStatus from '@/app/components/UI/ConnectionStatus';
import { toast } from 'react-hot-toast';
import realtimeService, { EventTopic, EventType } from '@/services/realtimeService';

export default function AuctionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch auction details function
  const fetchAuctionDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const auctionData = await auctionService.fetchAuctionById(id as string);
      setAuction(auctionData);
    } catch (err: any) {
      console.error('Error fetching auction details:', err);
      setError(err.message || 'Failed to load auction details');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch auction details on component mount
  useEffect(() => {
    if (!id) return;
    fetchAuctionDetails();
  }, [id]);
  
  // Subscribe to auction events
  useEffect(() => {
    if (!id) return;
    
    // Handle auction updates
    const handleAuctionUpdate = (data: any) => {
      if (data.data.auctionId !== id) return;
      
      // Show appropriate toast notification based on event type
      switch (data.type) {
        case EventType.AUCTION_BID_PLACED:
          if (user && data.data.bidderId === user.id) {
            toast.success(`Your bid of ${data.data.bidAmount} has been placed!`);
          } else {
            toast.success(`New bid of ${data.data.bidAmount} placed by ${data.data.bidderName}`);
          }
          break;
        case EventType.AUCTION_ENDED:
          if (user && data.data.winnerId === user.id) {
            toast.success(`Congratulations! You won this auction!`);
          } else {
            toast.success(`Auction has ended!`);
          }
          break;
      }
      
      // Refresh auction details
      fetchAuctionDetails();
    };
    
    // Subscribe to all auction events
    const auctionEvents = [
      EventType.AUCTION_BID_PLACED,
      EventType.AUCTION_ENDED,
      EventType.AUCTION_STARTED
    ];
    
    // Subscribe to each event type
    auctionEvents.forEach(eventType => {
      realtimeService.subscribe(
        EventTopic.AUCTION,
        undefined,
        eventType,
        handleAuctionUpdate
      );
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      auctionEvents.forEach(eventType => {
        realtimeService.unsubscribe(EventTopic.AUCTION, undefined, eventType);
      });
    };
  }, [id, user, fetchAuctionDetails]);
  
  // Handle bid success
  const handleBidSuccess = async (updatedAuction: AuctionItem) => {
    setAuction(updatedAuction);
    
    // Emit bid placed event through socket
    if (realtimeService.isConnected() && user) {
      realtimeService['socket']?.emit('publish', {
        topic: EventTopic.AUCTION,
        event: {
          type: EventType.AUCTION_BID_PLACED,
          data: {
            auctionId: updatedAuction._id,
            auctionTitle: updatedAuction.title,
            bidAmount: updatedAuction.currentPrice,
            bidderId: user.id,
            bidderName: user.username,
            timestamp: new Date().toISOString()
          }
        }
      });
    }
  };
  
  // Format currency
  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "0";
    return amount.toString();
  };
  
  // Get biome type color
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
  
  // Get status color
  const getStatusColor = (status: AuctionStatus): string => {
    switch (status) {
      case AuctionStatus.SCHEDULED:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case AuctionStatus.IN_PROGRESS:
        return "bg-green-100 text-green-800 border-green-300";
      case AuctionStatus.COMPLETED:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case AuctionStatus.FAILED:
        return "bg-red-100 text-red-800 border-red-300";
      case AuctionStatus.CANCELLED:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };
  
  // Check if user is highest bidder
  const isUserHighestBidder = (): boolean => {
    if (!user || !auction || !auction.bids || auction.bids.length === 0) return false;
    
    // Sort bids by amount (highest first)
    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    
    // Return true if the highest bid is from the current user
    return sortedBids[0].playerId === user.id;
  };
  
  // Check if the user can place a bid
  const canPlaceBid = (): boolean => {
    if (!user || !auction) return false;
    if (auction.status !== 'in-progress') return false;
    if (isUserHighestBidder()) return false;
    return true;
  };
  
  // Get main tile from auction
  const getMainTile = () => {
    if (!auction) return null;
    return auction.tiles && auction.tiles.length > 0 ? auction.tiles[0] : null;
  };
  
  // Get bid history items
  const getBidHistory = () => {
    if (!auction || !auction.bids || auction.bids.length === 0) return [];
    
    // Sort bids by timestamp (newest first)
    return [...auction.bids].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };
  
  // Check if auction is active
  const isAuctionActive = (): boolean => {
    if (!auction) return false;
    return auction.status === AuctionStatus.IN_PROGRESS || 
           auction.status === AuctionStatus.SCHEDULED;
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/game" className="text-white hover:text-gray-300">
            Back to Game
          </Link>
          <h1 className="text-xl font-semibold">Auction Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <AuthButton />
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-4xl mx-auto mt-8 pb-16">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading auction details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <div className="mt-4">
              <Link href="/game" className="text-blue-500 hover:underline">
                Return to Game
              </Link>
            </div>
          </div>
        ) : auction ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Auction header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{auction.title}</h2>
                  <p className="text-gray-600 mt-1">{auction.description}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(auction.status)}`}>
                    {auction.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Auction details */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tile preview */}
              <div className="col-span-1">
                {getMainTile() && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div 
                      className={`aspect-square w-full ${getTypeColor(getMainTile()?.biome || "")}`}
                    >
                      <div className="w-full h-full flex items-center justify-center text-5xl text-white font-bold">
                        {getMainTile()?.biome?.charAt(0) || "L"}
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-medium">{getMainTile()?.biome || "Land"}</h3>
                      <p className="text-sm text-gray-600">
                        Location: ({getMainTile()?.x}, {getMainTile()?.y})
                      </p>
                      {getMainTile()?.resources && Object.keys(getMainTile()?.resources || {}).length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Resources: {Object.keys(getMainTile()?.resources || {}).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <Link 
                    href={`/world?x=${getMainTile()?.x || 0}&y=${getMainTile()?.y || 0}`}
                    className="block w-full py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                  >
                    View on Map
                  </Link>
                </div>
              </div>
              
              {/* Auction info */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Current Price</p>
                      <p className="text-xl font-bold">{auction.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Starting Price</p>
                      <p className="text-lg">{auction.startingPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Time</p>
                      <p className="text-sm">{formatDate(auction.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Time</p>
                      <p className="text-sm">{formatDate(auction.endTime)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Time Remaining</p>
                      <p className="text-lg font-mono">
                        {isAuctionActive() ? (
                          <AuctionTimer 
                            endTime={auction.endTime} 
                            className="font-mono text-lg" 
                          />
                        ) : (
                          "Auction has ended"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Bidding section */}
                {canPlaceBid() ? (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Place Your Bid</h3>
                    <BidForm 
                      auction={auction} 
                      onSuccess={handleBidSuccess} 
                      onCancel={() => router.push('/game')}
                    />
                  </div>
                ) : isUserHighestBidder() ? (
                  <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">You are the highest bidder!</h3>
                    <p className="mt-2">
                      Your bid of {auction.currentPrice} is currently winning.
                    </p>
                  </div>
                ) : !isAuctionActive() ? (
                  <div className="bg-gray-50 border border-gray-300 text-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Auction {auction.status}</h3>
                    <p className="mt-2">
                      This auction is no longer accepting bids.
                    </p>
                  </div>
                ) : !user ? (
                  <div className="bg-blue-50 border border-blue-300 text-blue-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Login to place a bid</h3>
                    <p className="mt-2">
                      You must be logged in to participate in auctions.
                    </p>
                  </div>
                ) : null}
                
                {/* Bid history */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Bid History</h3>
                  {(!auction.bids || auction.bids.length === 0) ? (
                    <p className="text-gray-500">No bids have been placed yet.</p>
                  ) : (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bidder
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getBidHistory().map((bid, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {bid.playerId === user?.id ? (
                                  <span className="font-medium text-blue-600">You</span>
                                ) : (
                                  <span>{bid.playerName || `Player ${bid.playerId.substring(0, 5)}...`}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {formatCurrency(bid.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(bid.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Auction not found</p>
            <div className="mt-4">
              <Link href="/game" className="text-blue-500 hover:underline">
                Return to Game
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 