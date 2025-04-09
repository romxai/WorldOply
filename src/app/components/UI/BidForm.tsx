/**
 * BidForm.tsx
 * Component for placing bids on auctions with validation
 */
import React, { useState, useEffect } from 'react';
import { AuctionItem } from '@/types/auction';
import auctionService from '@/services/auctionService';
import { useAuth } from '@/context/AuthContext';

interface BidFormProps {
  auction: AuctionItem;
  onSuccess?: (updatedAuction: AuctionItem) => void;
  onCancel?: () => void;
  className?: string;
}

const BidForm: React.FC<BidFormProps> = ({ 
  auction, 
  onSuccess, 
  onCancel,
  className = '' 
}) => {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Initialize bid amount when auction changes
  useEffect(() => {
    // Set initial bid amount to current price + minimum increment
    const minIncrement = auction.minIncrement || 1;
    setBidAmount(auction.currentPrice + minIncrement);
  }, [auction]);
  
  // Function to format currency
  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "0";
    return amount.toString();
  };
  
  // Check if bid amount is valid
  const isValidBid = (): boolean => {
    // Must be logged in
    if (!user) return false;
    
    // Must be greater than current price + minimum increment
    const minIncrement = auction.minIncrement || 1;
    const minValidBid = auction.currentPrice + minIncrement;
    
    return bidAmount >= minValidBid;
  };
  
  // Get validation message
  const getValidationMessage = (): string => {
    if (!user) {
      return 'You must be logged in to place a bid';
    }
    
    const minIncrement = auction.minIncrement || 1;
    const minValidBid = auction.currentPrice + minIncrement;
    
    if (bidAmount < minValidBid) {
      return `Bid must be at least ${minValidBid}`;
    }
    
    return '';
  };
  
  // Check if user is the highest bidder
  const isUserHighestBidder = (): boolean => {
    if (!user || !auction.bids || auction.bids.length === 0) return false;
    
    // Sort bids by amount (highest first)
    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    
    // Return true if the highest bid is from the current user
    return sortedBids[0].playerId === user.id;
  };
  
  // Check if bidding is allowed for the current user
  const canPlaceBid = (): boolean => {
    if (!user) return false;
    if (auction.status !== 'in-progress') return false;
    if (isUserHighestBidder()) return false;
    return true;
  };
  
  // Handle bid submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    // Check if the user can place a bid
    if (!canPlaceBid()) {
      setError(isUserHighestBidder() ? 
        'You are already the highest bidder' : 
        'You cannot place a bid at this time');
      return;
    }
    
    // Validate bid
    if (!isValidBid()) {
      setError(getValidationMessage());
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Place the bid
      const updatedAuction = await auctionService.placeBid(auction._id, bidAmount);
      
      // Show success message
      setSuccess(`Bid of ${bidAmount} placed successfully!`);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(updatedAuction);
      }
    } catch (err: any) {
      console.error('Error placing bid:', err);
      setError(err.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle bid amount change with increment/decrement
  const incrementBid = (amount: number) => {
    setBidAmount((prev) => prev + amount);
  };
  
  const decrementBid = (amount: number) => {
    const minIncrement = auction.minIncrement || 1;
    const minValidBid = auction.currentPrice + minIncrement;
    
    setBidAmount((prev) => Math.max(minValidBid, prev - amount));
  };
  
  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-center py-1 px-2 border border-red-300 bg-red-50 mb-3 text-xs">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-500 text-center py-1 px-2 border border-green-300 bg-green-50 mb-3 text-xs">
            {success}
          </div>
        )}
        
        <div className="mb-3">
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid
          </label>
          
          <div className="flex items-center">
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 bg-gray-100 text-gray-600 rounded-l"
              onClick={() => decrementBid(10)}
              disabled={isSubmitting}
            >
              -
            </button>
            
            <input
              type="number"
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="flex-1 p-2 border-y border-gray-300 text-center"
              disabled={isSubmitting}
            />
            
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 bg-gray-100 text-gray-600 rounded-r"
              onClick={() => incrementBid(10)}
              disabled={isSubmitting}
            >
              +
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Current price: {auction.currentPrice}
          </div>
          <div className="text-xs text-gray-500">
            Minimum bid: {auction.currentPrice + (auction.minIncrement || 1)}
          </div>
        </div>
        
        <div className="flex justify-between gap-2">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isSubmitting || !isValidBid()}
          >
            {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidForm; 