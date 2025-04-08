/**
 * Event types for realtime communication
 */
export enum EventType {
  AUCTION_CREATED = 'auction:created',
  AUCTION_STARTED = 'auction:started',
  AUCTION_BID_PLACED = 'auction:bid-placed',
  AUCTION_ENDED = 'auction:ended',
  LAND_UPDATED = 'land:updated',
  PLAYER_RESOURCES_UPDATED = 'player:resources-updated',
  SYSTEM_ANNOUNCEMENT = 'system:announcement'
}

/**
 * Topics for event subscriptions
 */
export enum EventTopic {
  GLOBAL = 'global',
  AUCTION = 'auction',
  LAND_SQUARE = 'land',
  PLAYER = 'player',
  MARKETPLACE = 'marketplace'
}

/**
 * Interface for auction created event
 */
export interface AuctionCreatedEvent {
  auctionId: string;
  title: string;
  startingPrice: number;
  endTime: string;
  startTime: string;
  tileIds: string[];
  createdBy: string;
}

/**
 * Interface for auction bid placed event
 */
export interface AuctionBidPlacedEvent {
  auctionId: string;
  playerId: string;
  bidAmount: number;
  timestamp: string;
  previousPrice?: number;
}

/**
 * Interface for auction ended event
 */
export interface AuctionEndedEvent {
  auctionId: string;
  winningBid?: {
    playerId: string;
    bidAmount: number;
  };
  tileIds: string[];
  finalPrice?: number;
}

/**
 * Utility functions for topic generation
 */
export function getAuctionTopic(auctionId: string): string {
  return `${EventTopic.AUCTION}:${auctionId}`;
}

export function getGlobalAuctionTopic(): string {
  return EventTopic.AUCTION;
} 