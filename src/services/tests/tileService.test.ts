/**
 * TileService test file
 * 
 * Note: These tests would typically be run in a test environment.
 * For now, this file serves as documentation for how to use the service.
 */
import tileService from '../tileService';
import { TileOwnership, TileReference } from '../../types/auction';

/**
 * Example usage of TileService
 */

// Get tile information by coordinates
async function getTileInfo(x: number, y: number) {
  try {
    const tileInfo = await tileService.getTileByCoordinates(x, y);
    console.log(`Tile info at (${x}, ${y}):`, tileInfo);
    
    if (tileInfo.owned) {
      console.log(`This tile is owned by ${tileInfo.owner}`);
    } else if (tileInfo.inAuction) {
      console.log(`This tile is currently in auction: ${tileInfo.auctionId}`);
    } else {
      console.log('This tile is available');
    }
    
    return tileInfo;
  } catch (error) {
    console.error(`Failed to fetch tile info at (${x}, ${y}):`, error);
    return null;
  }
}

// Get tile details by ID
async function getTileById(tileId: string) {
  try {
    const tile = await tileService.getTileById(tileId);
    console.log(`Tile ${tileId} details:`, tile);
    return tile;
  } catch (error) {
    console.error(`Failed to fetch tile ${tileId}:`, error);
    return null;
  }
}

// Get all tiles owned by the current user
async function getMyTiles() {
  try {
    const tiles = await tileService.getMyTiles();
    console.log('My tiles:', tiles);
    return tiles;
  } catch (error) {
    console.error('Failed to fetch my tiles:', error);
    return [];
  }
}

// Claim an unowned tile
async function claimTile(x: number, y: number) {
  try {
    const result = await tileService.claimTile(x, y);
    console.log(`Successfully claimed tile at (${x}, ${y}):`, result);
    return result;
  } catch (error) {
    console.error(`Failed to claim tile at (${x}, ${y}):`, error);
    return null;
  }
}

// Export examples for potential use
export {
  getTileInfo,
  getTileById,
  getMyTiles,
  claimTile
}; 