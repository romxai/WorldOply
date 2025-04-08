import { useEffect, useState } from 'react';
import auctionService from '@/services/auctionService';
import { TileWithOwnership, AuctionItem, AuctionBidInfo } from '@/types/auction';
import { EventType } from '@/types/realtime';

export const useTileAuctionStatus = (tileId: string | null) => {
  const [tileData, setTileData] = useState<TileWithOwnership | null>(null);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [auctionInfo, setAuctionInfo] = useState<AuctionBidInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tileId) return;
    
    let isMounted = true;
    setLoading(true);

    const fetchTileData = async () => {
      try {
        // Fetch auctions for this tile
        const tileAuctions = await auctionService.getAuctionsForTile(tileId);
        if (isMounted) {
          setAuctions(tileAuctions);
        }
        
        // Get detailed auction info
        const info = await auctionService.getAuctionInfoForTile(tileId);
        if (isMounted) {
          setAuctionInfo(info);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTileData();

    // Set up WebSocket subscription for real-time updates
    const unsubscribe = () => {
      // If there's an active auction, subscribe to it
      if (auctions.length > 0) {
        const activeAuction = auctions.find(auction => 
          auction.status === 'in-progress' || auction.status === 'scheduled'
        );
        
        if (activeAuction) {
          auctionService.subscribeToAuction(activeAuction._id, (event) => {
            if (event.type === EventType.AUCTION_BID_PLACED) {
              // Refresh auction data when a bid is placed
              fetchTileData();
            } else if (event.type === EventType.AUCTION_ENDED) {
              // Refresh auction data when the auction ends
              fetchTileData();
            }
          });
          
          return () => {
            // No direct unsubscribe method in the service, but we can create one if needed
          };
        }
      }
      
      return () => {};
    };

    const cleanup = unsubscribe();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [tileId, auctions.length]);

  return { tileData, auctions, auctionInfo, loading, error };
}; 