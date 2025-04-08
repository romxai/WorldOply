/**
 * Auction Service
 * Handles auction-related API calls and WebSocket subscriptions
 */
import apiService from './apiService';
import realtimeService from './realtimeService';
import { 
  EventTopic, 
  EventType, 
  AuctionBidPlacedEvent, 
  AuctionCreatedEvent, 
  AuctionEndedEvent 
} from '../types/realtime';
import { AuctionItem, AuctionBidInfo } from '../types/auction';
import notificationService from './notificationService';

// Type for WebSocket auction events
export type AuctionEvent = 
  | { type: EventType.AUCTION_BID_PLACED; data: AuctionBidPlacedEvent }
  | { type: EventType.AUCTION_CREATED; data: AuctionCreatedEvent }
  | { type: EventType.AUCTION_ENDED; data: AuctionEndedEvent };

// Add this interface after the AuctionEvent type
interface BidResponse {
  success: boolean;
  bid: {
    playerId: string;
    amount: number;
    timestamp: string;
  };
  previousPrice: number;
  auctionId: string;
}

class AuctionService {
  /**
   * Fetch all active auctions
   */
  public async getActiveAuctions(): Promise<AuctionItem[]> {
    return apiService.get<AuctionItem[]>('/api/auctions');
  }
  
  /**
   * Get a specific auction by ID
   */
  public async getAuction(auctionId: string): Promise<AuctionItem> {
    return apiService.get<AuctionItem>(`/api/auctions/${auctionId}`);
  }
  
  /**
   * Place a bid on an auction
   */
  public async placeBid(auctionId: string, amount: number): Promise<BidResponse> {
    console.log(`Placing bid on auction ${auctionId} for ${amount} coins`);
    try {
      const response = await apiService.post<BidResponse>(`/api/auctions/${auctionId}/bid`, { amount });
      console.log('Bid response:', response);
      
      // Handle bid success - manually trigger local update if WebSocket event doesn't arrive
      if (response && response.success) {
        // Create a synthetic bid event in case the WebSocket event doesn't arrive
        setTimeout(() => {
          // Check if we've received a WebSocket event for this bid in the last 2 seconds
          // If not, simulate a local event
          console.log('Checking if WebSocket event was received for bid...');
          
          // Create a synthetic bid event
          const bidEvent: AuctionBidPlacedEvent = {
            auctionId: auctionId,
            playerId: response.bid.playerId,
            bidAmount: amount,
            timestamp: new Date().toISOString(),
            previousPrice: response.previousPrice
          };
          
          // Broadcast locally to update UI
          this.notifyBidPlaced(bidEvent);
        }, 2000);
      }
      
      return response;
    } catch (error) {
      console.error('Bid placement failed:', error);
      throw error;
    }
  }
  
  /**
   * Notify components about a bid placed (used as fallback)
   */
  private notifyBidPlaced(data: AuctionBidPlacedEvent): void {
    const event: AuctionEvent = { 
      type: EventType.AUCTION_BID_PLACED, 
      data 
    };
    
    // Find all subscriptions for this event type
    const subscriptions = Array.from(document.querySelectorAll('[data-auction-subscription]'));
    
    // Log event for debugging
    console.log('Broadcasting local bid event:', event);
    
    // Dispatch a custom event that components can listen for
    const customEvent = new CustomEvent('auction:bid-placed', { 
      detail: event,
      bubbles: true 
    });
    
    document.dispatchEvent(customEvent);
  }
  
  /**
   * Get auctions for a specific tile
   */
  public async getAuctionsForTile(tileId: string): Promise<AuctionItem[]> {
    return apiService.get<AuctionItem[]>(`/api/auctions/tile/${tileId}`);
  }
  
  /**
   * Get user's active bids
   */
  public async getMyBids(): Promise<AuctionItem[]> {
    return apiService.get<AuctionItem[]>('/api/auctions?filter=myBids');
  }
  
  /**
   * Subscribe to a specific auction's updates via WebSocket
   */
  public subscribeToAuction(auctionId: string, callback: (event: AuctionEvent) => void): void {
    // Use a single shared handler for all events for this auction
    const eventHandler = (eventType: EventType.AUCTION_BID_PLACED | EventType.AUCTION_CREATED | EventType.AUCTION_ENDED) => 
      (data: any) => {
        // Only process events for this specific auction
        if (data.auctionId === auctionId) {
          // Convert to proper event format and notify callback
          callback({ 
            type: eventType, 
            data 
          });
        }
      };
    
    // Subscribe to all relevant auction events with the shared handler
    realtimeService.subscribe(EventTopic.AUCTION, auctionId, EventType.AUCTION_BID_PLACED, 
      eventHandler(EventType.AUCTION_BID_PLACED));
    
    realtimeService.subscribe(EventTopic.AUCTION, auctionId, EventType.AUCTION_CREATED, 
      eventHandler(EventType.AUCTION_CREATED));
    
    realtimeService.subscribe(EventTopic.AUCTION, auctionId, EventType.AUCTION_ENDED, 
      eventHandler(EventType.AUCTION_ENDED));
  }
  
  /**
   * Unsubscribe from a specific auction's updates
   */
  public unsubscribeFromAuction(auctionId: string): void {
    realtimeService.unsubscribe(EventTopic.AUCTION, auctionId);
  }
  
  /**
   * Subscribe to all auction-related events
   */
  public subscribeToAllAuctions(callback: (event: AuctionEvent) => void): void {
    console.log('Subscribing to all auction events');
    
    // Use a single subscription to the AUCTION topic for all auction events
    // This avoids multiple redundant subscriptions
    
    // Handle bid placed events
    realtimeService.subscribe(EventTopic.AUCTION, undefined, EventType.AUCTION_BID_PLACED, (data: AuctionBidPlacedEvent) => {
      callback({ type: EventType.AUCTION_BID_PLACED, data });
      // Only show notification, don't trigger additional API calls
      notificationService.showAuctionNotification(data);
    });
    
    // Handle auction created events
    realtimeService.subscribe(EventTopic.AUCTION, undefined, EventType.AUCTION_CREATED, (data: AuctionCreatedEvent) => {
      callback({ type: EventType.AUCTION_CREATED, data });
      // Only show notification, don't trigger additional API calls
      notificationService.showAuctionNotification(data);
    });
    
    // Handle auction ended events
    realtimeService.subscribe(EventTopic.AUCTION, undefined, EventType.AUCTION_ENDED, (data: AuctionEndedEvent) => {
      callback({ type: EventType.AUCTION_ENDED, data });
      // Only show notification, don't trigger additional API calls
      notificationService.showAuctionNotification(data);
    });
  }
  
  /**
   * Unsubscribe from all auction-related events
   */
  public unsubscribeFromAllAuctions(): void {
    // Unsubscribe from all auction topics at once
    realtimeService.unsubscribe(EventTopic.AUCTION);
  }
  
  /**
   * Get detailed auction info for a specific tile
   */
  public async getAuctionInfoForTile(tileId: string): Promise<AuctionBidInfo | null> {
    try {
      const auctions = await this.getAuctionsForTile(tileId);
      if (!auctions || auctions.length === 0) {
        return null;
      }
      
      // Get the active auction (if any)
      const activeAuction = auctions.find(auction => 
        auction.status === 'in-progress' || auction.status === 'scheduled'
      );
      
      if (!activeAuction) {
        return null;
      }
      
      // Get user's bids if any
      const myBids = await this.getMyBids();
      const myAuctionBids = myBids
        .filter(bid => bid._id === activeAuction._id)
        .sort((a, b) => b.currentPrice - a.currentPrice);
      
      return {
        auctionId: activeAuction._id,
        currentPrice: activeAuction.currentPrice,
        minIncrement: activeAuction.minIncrement,
        endsAt: new Date(activeAuction.endTime),
        highestBidder: activeAuction.bids.length > 0 ? {
          id: activeAuction.bids[0].playerId,
          username: 'Player ' + activeAuction.bids[0].playerId
        } : undefined,
        myLastBid: myAuctionBids.length > 0 ? myAuctionBids[0].currentPrice : undefined
      };
    } catch (error) {
      console.error('Failed to get auction info for tile:', error);
      return null;
    }
  }
  
  /**
   * Create a new auction
   */
  public async createAuction(auctionData: any): Promise<AuctionItem> {
    return apiService.post<AuctionItem>('/api/auctions', auctionData);
  }
}

// Create a singleton instance
const auctionService = new AuctionService();
export default auctionService; 