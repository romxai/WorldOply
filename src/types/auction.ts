/**
 * Auction types and interfaces for the WorldOply frontend
 * These match the backend structure from the DC World Building API
 */

import { User } from './user';

/**
 * Types of auctions supported by the system
 */
export enum AuctionType {
  OPEN = 'open',
  BLIND = 'blind',
  DUTCH = 'dutch',
  SEALED = 'sealed',
  VICKREY = 'vickrey',
  RESERVE = 'reserve',
}

/**
 * Auction status values
 */
export enum AuctionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Tile information within an auction
 */
export interface AuctionTile {
  _id: string;
  id?: string;
  x: number;
  y: number;
  biome: string;
  type: string;
  resources?: {
    [key: string]: any;
  };
}

/**
 * Bid information
 */
export interface Bid {
  playerId: string;
  playerName?: string;
  amount: number;
  timestamp: string;
  isAutomatic?: boolean;
  maxBid?: number;
}

/**
 * Auction history entry
 */
export interface AuctionHistoryEntry {
  timestamp: string;
  event: string;
  data: any;
}

/**
 * Main auction item interface
 */
export interface AuctionItem {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  startingPrice: number;
  currentPrice: number;
  minIncrement?: number;
  reservePrice?: number;
  winner?: string;
  finalPrice?: number;
  tiles: AuctionTile[];
  auctionType: AuctionType;
  status: AuctionStatus;
  featuredAuction: boolean;
  bids: Bid[];
  history?: AuctionHistoryEntry[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from auction API endpoints
 */
export interface AuctionResponse {
  status: number;
  success: boolean;
  data?: AuctionItem | AuctionItem[];
  message?: string;
} 