import { useState, useCallback } from 'react';
import auctionService from '@/services/auctionService';
import { AuctionBidInfo, TileAuctionStatus } from '@/types/auction';
import { AuctionEvent } from '@/services/auctionService';

export const useAuctionService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuctionInfo = useCallback(async (tileId: string): Promise<AuctionBidInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await auctionService.getAuctionInfoForTile(tileId);
      return info;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auction info');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const placeBid = useCallback(async (auctionId: string, amount: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await auctionService.placeBid(auctionId, amount);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribeToAuctionUpdates = useCallback((auctionId: string, callback: (event: AuctionEvent) => void) => {
    return auctionService.subscribeToAuction(auctionId, callback);
  }, []);

  return {
    isLoading,
    error,
    getAuctionInfo,
    placeBid,
    subscribeToAuctionUpdates
  };
}; 