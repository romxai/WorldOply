/**
 * Tile Service
 * Handles tile-related API calls and data management
 */
import apiService from './apiService';
import { TileOwnership, TileReference } from '../types/auction';

// Interface for tile generation data
interface TileGenerationData {
  location: {
    x: number;
    y: number;
  };
  biomeType: string;
  terrainType: string;
  resources?: any;
}

class TileService {
  /**
   * Get tile information by coordinates
   */
  public async getTileByCoordinates(x: number, y: number): Promise<TileOwnership> {
    return apiService.get<TileOwnership>(`/api/tiles/coordinates/${x}/${y}`);
  }
  
  /**
   * Get tile details by ID
   */
  public async getTileById(tileId: string): Promise<TileReference> {
    return apiService.get<TileReference>(`/api/tiles/${tileId}`);
  }
  
  /**
   * Get all tiles owned by the current user
   */
  public async getMyTiles(): Promise<TileReference[]> {
    return apiService.get<TileReference[]>('/api/players/me/tiles');
  }
  
  /**
   * Claim an unowned tile (if supported by the backend)
   */
  public async claimTile(x: number, y: number): Promise<any> {
    return apiService.post('/api/tiles/claim', { x, y });
  }

  /**
   * Get tile ownership information by tile ID
   */
  public async getTileOwnership(tileId: string): Promise<TileOwnership> {
    return apiService.get<TileOwnership>(`/api/tiles/${tileId}/ownership`);
  }

  /**
   * Generate new tiles with specified coordinates, biome and terrain type
   * @param tiles Array of tile data to generate
   */
  public async generateTiles(tiles: TileGenerationData[]): Promise<any> {
    return apiService.post('/api/land/generate', { tiles });
  }
}

// Create a singleton instance
const tileService = new TileService();
export default tileService; 