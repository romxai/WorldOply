/**
 * Types related to auctions
 */

/**
 * Auction status enum
 */
export enum AuctionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Auction type enum
 */
export enum AuctionType {
  OPEN = 'open',
  BLIND = 'blind',
  DUTCH = 'dutch',
  SEALED = 'sealed',
  VICKREY = 'vickrey',
  RESERVE = 'reserve'
}

/**
 * Bid information within an auction
 */
export interface Bid {
  playerId: string;
  amount: number;
  timestamp: Date;
  isAutomatic?: boolean;
  maxBid?: number;
}

/**
 * Tile reference in auction
 */
export interface TileReference {
  id: string;
  x: number;
  y: number;
  type?: string;
  biome?: string;
}

/**
 * Auction item interface
 */
export interface AuctionItem {
  _id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  tiles: TileReference[];
  status: AuctionStatus;
  auctionType: AuctionType;
  bids: Bid[];
  winner?: string;
  finalPrice?: number;
  featuredAuction?: boolean;
}

/**
 * Tile ownership information
 */
export interface TileOwnership {
  tileId: string;
  ownerId?: string;
  ownerUsername?: string;
  acquiredAt?: Date;
  inAuction: boolean;
  auctionId?: string;
}

export interface TileAuctionStatus {
  isInAuction: boolean;
  auctionId?: string;
  currentPrice?: number;
  endsAt?: Date;
  highestBidder?: {
    id: string;
    username: string;
  };
}

export interface AuctionBidInfo {
  auctionId: string;
  currentPrice: number;
  minIncrement: number;
  endsAt: Date;
  highestBidder?: {
    id: string;
    username: string;
  };
  myLastBid?: number;
}

import { type Tile } from './tile';

export interface TileWithOwnership extends Tile {
  ownership?: TileOwnership;
  auctionStatus?: TileAuctionStatus;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface TileGenerationData {
  location: {
    x: number;
    y: number;
  };
  biomeType: string;
  terrainType: string;
  resources?: any;
}

export interface AuctionCreationData {
  title: string;
  description?: string;
  tileIds: string[];
  auctionType: 'open' | 'blind';
  startingPrice: number;
  startTime: Date | string;
  endTime: Date | string;
} 