import React, { useState, useEffect } from 'react';
import { AuctionBidInfo, TileOwnership } from '@/types/auction';
import AuctionTimer from '@/app/components/UI/AuctionTimer';
import { Button } from '@/app/components/UI/Button';
import { Input } from '@/app/components/UI/Input';
import { useAuctionService } from '@/hooks/useAuctionService';
import { formatCurrency } from '@/utils/formatters';
import { AuctionEvent } from '@/services/auctionService';
import { EventType } from '@/types/realtime';

interface AuctionInfoProps {
  tileId: string;
  ownership: TileOwnership;
  auctionInfo?: AuctionBidInfo;
  onBidPlaced?: () => void;
}

export const AuctionInfo: React.FC<AuctionInfoProps> = ({
  tileId,
  ownership,
  auctionInfo,
  onBidPlaced
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentInfo, setCurrentInfo] = useState<AuctionBidInfo | undefined>(auctionInfo);
  const { placeBid, subscribeToAuctionUpdates } = useAuctionService();

  // Update local state when props change
  useEffect(() => {
    setCurrentInfo(auctionInfo);
  }, [auctionInfo]);

  // Subscribe to WebSocket updates for this auction
  useEffect(() => {
    if (!auctionInfo?.auctionId) return;
    
    let mounted = true;
    let hasSubscribed = false;
    
    // Subscribe only once to this auction's updates
    const handleAuctionUpdate = (event: AuctionEvent) => {
      if (!mounted) return;
      
      if (event.type === EventType.AUCTION_BID_PLACED) {
        // Only update if this event is for our auction
        if (currentInfo && event.data.auctionId === currentInfo.auctionId) {
          setCurrentInfo(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              currentPrice: event.data.bidAmount,
              // Update highest bidder info
              highestBidder: {
                id: event.data.playerId,
                username: event.data.playerId === 'current-user' ? 'You' : `Player ${event.data.playerId.substring(0, 5)}...`
              }
            };
          });
        }
      }
    };
    
    // Only subscribe if we haven't already for this auction
    if (!hasSubscribed) {
      subscribeToAuctionUpdates(auctionInfo.auctionId, handleAuctionUpdate);
      hasSubscribed = true;
    }
    
    // Clean up subscription on unmount
    return () => {
      mounted = false;
      // Cleanup handled at service level
    };
  }, [auctionInfo?.auctionId, subscribeToAuctionUpdates]);

  if (!ownership.inAuction || !currentInfo) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No active auction for this tile.</p>
      </div>
    );
  }

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInfo || isSubmitting) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < (currentInfo.currentPrice + currentInfo.minIncrement)) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`AuctionInfo: Placing bid of ${amount} on auction ${currentInfo.auctionId}`);
      await placeBid(currentInfo.auctionId, amount);
      console.log(`AuctionInfo: Bid placed successfully`);
      
      setBidAmount('');
      if (onBidPlaced) onBidPlaced();
    } catch (error) {
      console.error('Failed to place bid:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minBidAmount = currentInfo.currentPrice + currentInfo.minIncrement;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Current Auction</h3>
        <AuctionTimer endTime={currentInfo.endsAt} />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Current Price: {formatCurrency(currentInfo.currentPrice)}
        </p>
        {currentInfo.highestBidder && (
          <p className="text-sm text-gray-600">
            Highest Bidder: {currentInfo.highestBidder.username}
          </p>
        )}
        {currentInfo.myLastBid && (
          <p className="text-sm text-gray-600">
            Your Last Bid: {formatCurrency(currentInfo.myLastBid)}
          </p>
        )}
      </div>

      <form onSubmit={handleBidSubmit} className="space-y-3">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
            Your Bid (min: {formatCurrency(minBidAmount)})
          </label>
          <Input
            id="bidAmount"
            type="number"
            min={minBidAmount}
            step="0.01"
            value={bidAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBidAmount(e.target.value)}
            placeholder={`Enter bid amount (min: ${formatCurrency(minBidAmount)})`}
            className="mt-1"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !bidAmount || parseFloat(bidAmount) < minBidAmount}
          className="w-full"
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </Button>
      </form>
    </div>
  );
}; 