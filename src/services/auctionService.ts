/**
 * Auction service for the WorldOply frontend
 * Handles communication with the DC World Building API for auction functionality
 */
import apiService from './apiService';
import { AuctionItem, AuctionResponse, Bid, AuctionStatus } from '@/types/auction';

/**
 * Service for interacting with the auction API endpoints
 */
class AuctionService {
  private baseUrl = '/api/auctions';

  /**
   * Fetch all active auctions with optional filtering
   * @param filter Optional filter parameter (e.g., 'myBids')
   * @returns Promise with auction items
   */
  public async fetchAuctions(filter?: string): Promise<AuctionItem[]> {
    try {
      const params = filter ? { filter } : undefined;
      const response = await apiService.get<AuctionItem[]>(this.baseUrl, params);
      
      // The response contains an array of auction items directly
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching auctions:', error);
      throw error;
    }
  }

  /**
   * Fetch a single auction by ID
   * @param id Auction ID
   * @returns Promise with auction details
   */
  public async fetchAuctionById(id: string): Promise<AuctionItem> {
    try {
      const response = await apiService.get<AuctionItem>(`${this.baseUrl}/${id}`);
      
      // The response is the auction data directly
      return response as AuctionItem;
    } catch (error) {
      console.error(`Error fetching auction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Place a bid on an auction
   * @param auctionId Auction ID
   * @param amount Bid amount
   * @returns Promise with updated auction details
   */
  public async placeBid(auctionId: string, amount: number): Promise<AuctionItem> {
    try {
      const response = await apiService.post<AuctionResponse>(`${this.baseUrl}/${auctionId}/bid`, {
        amount
      });
      
      // Return the response directly, just like in createAuction
      return response as unknown as AuctionItem;
    } catch (error) {
      console.error(`Error placing bid on auction ${auctionId}:`, error);
      throw error;
    }
  }

  /**
   * Get the status of an auction
   * @param id Auction ID
   * @returns Promise with auction status
   */
  public async getAuctionStatus(id: string): Promise<AuctionStatus> {
    try {
      const auction = await this.fetchAuctionById(id);
      return auction.status;
    } catch (error) {
      console.error(`Error getting auction status for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all auctions with bids from the current user
   * @returns Promise with auctions the user has bid on
   */
  public async getMyBids(): Promise<AuctionItem[]> {
    return this.fetchAuctions('myBids');
  }

  /**
   * Create a new auction (admin only)
   * @param auctionData Auction data for creation
   * @returns Promise with created auction
   */
  public async createAuction(auctionData: {
    title: string;
    description?: string;
    tileIds: string[];
    auctionType: string;
    startingPrice: number;
    startTime: Date;
    endTime: Date;
  }): Promise<AuctionItem> {
    try {
      const response = await apiService.post<AuctionResponse>(this.baseUrl, auctionData);
      
      // The response already contains the auction data directly
      // No need to check status or access data property
      return response as unknown as AuctionItem;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  }
}

// Export as singleton
const auctionService = new AuctionService();
export default auctionService; 