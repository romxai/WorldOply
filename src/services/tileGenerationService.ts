/**
 * Tile Generation Service for WorldOply
 * Handles random tile selection from the world map for auction creation
 */
import apiService from './apiService';
import { AuctionTile } from '@/types/auction';

// Constants for world grid dimensions
// These should match config.ts in WorldGenerator
const WORLD_GRID_WIDTH = 1080;
const WORLD_GRID_HEIGHT = 540;

// These types match the backend models
enum BiomeType {
  OCEAN = 'ocean',
  SHALLOW_WATER = 'shallow_water',
  BEACH = 'beach',
  DESERT = 'desert',
  GRASSLAND = 'grassland',
  PLAINS = 'plains',
  FOREST = 'forest',
  RAINFOREST = 'rainforest',
  TAIGA = 'taiga',
  TUNDRA = 'tundra',
  SNOW = 'snow',
  MOUNTAINS = 'mountains',
  HILLS = 'hills',
  MARSH = 'marsh',
  SWAMP = 'swamp',
  VOLCANIC = 'volcanic',
  SAVANNA = 'savanna'
}

// Terrain types for the backend
enum TerrainType {
  FLAT = 'flat',
  HILLS = 'hills',
  MOUNTAINS = 'mountains',
  WATER = 'water',
  COASTAL = 'coastal',
  ROCKY = 'rocky',
  VALLEY = 'valley',
  PLATEAU = 'plateau',
  CANYON = 'canyon',
  CLIFF = 'cliff'
}

// Map frontend biome types to backend biome types
const biomeTypeMap: Record<number, BiomeType> = {
  0: BiomeType.OCEAN, // OCEAN_DEEP 
  1: BiomeType.OCEAN, // OCEAN_MEDIUM
  2: BiomeType.SHALLOW_WATER, // OCEAN_SHALLOW
  3: BiomeType.BEACH, // BEACH
  4: BiomeType.BEACH, // ROCKY_SHORE - Map to BEACH instead of COASTAL
  5: BiomeType.GRASSLAND, // SCRUBLAND
  6: BiomeType.DESERT, // DESERT
  7: BiomeType.SAVANNA, // SAVANNA
  8: BiomeType.RAINFOREST, // TROPICAL_RAINFOREST
  9: BiomeType.GRASSLAND, // GRASSLAND
  10: BiomeType.FOREST, // WOODLAND
  11: BiomeType.FOREST, // SEASONAL_FOREST
  12: BiomeType.FOREST, // TEMPERATE_FOREST
  13: BiomeType.RAINFOREST, // TEMPERATE_RAINFOREST
  14: BiomeType.TAIGA, // BOREAL_FOREST
  15: BiomeType.TUNDRA, // TUNDRA
  16: BiomeType.SNOW, // ICE
  17: BiomeType.MOUNTAINS, // MOUNTAINS
  18: BiomeType.VOLCANIC, // VOLCANO
  19: BiomeType.MARSH, // MARSH
  20: BiomeType.SWAMP, // SWAMP
};

interface TileData {
  x: number;
  y: number;
  biome: BiomeType;
  terrain: TerrainType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  elevation: number;
  moisture: number;
  temperature: number;
}

interface TileGenerationResponse {
  status: number;
  tiles: never[];
  success: boolean;
  data?: {
    message: string;
    tiles: AuctionTile[];
  };
  message?: string;
}

/**
 * Service for generating and managing tiles for auctions
 */
class TileGenerationService {
  /**
   * Access to world generator instance
   * This is set externally by the WorldMap component
   */
  private worldGenerator: any = null;
  
  /**
   * Set the world generator instance
   * Called by WorldMap when initialized
   */
  public setWorldGenerator(generator: any): void {
    this.worldGenerator = generator;
    console.log('World generator set in TileGenerationService');
  }
  
  /**
   * Maps frontend biome type ID to backend BiomeType
   * @param frontendBiomeTypeId The biome type ID from the frontend
   * @returns The corresponding backend BiomeType
   */
  public getBiomeTypeFromFrontendId(frontendBiomeTypeId: number): BiomeType {
    return biomeTypeMap[frontendBiomeTypeId] || BiomeType.GRASSLAND;
  }
  
  /**
   * Determines terrain type based on frontend biome type and elevation
   * @param frontendBiomeTypeId The biome type ID from the frontend
   * @param elevation The elevation value
   * @returns The appropriate TerrainType
   */
  public getTerrainTypeFromTileData(frontendBiomeTypeId: number, elevation: number): TerrainType {
    // Ocean biomes
    if (frontendBiomeTypeId <= 2) {
      return TerrainType.WATER;
    }
    
    // Beach or coastal biomes
    if (frontendBiomeTypeId === 3 || frontendBiomeTypeId === 4) {
      return TerrainType.COASTAL;
    }
    
    // Mountain biomes
    if (frontendBiomeTypeId === 17 || frontendBiomeTypeId === 18) {
      return TerrainType.MOUNTAINS;
    }
    
    // Determine based on elevation
    if (elevation > 0.8) {
      return TerrainType.MOUNTAINS;
    } else if (elevation > 0.6) {
      return TerrainType.HILLS;
    } else if (elevation < 0.3) {
      return TerrainType.VALLEY;
    } else {
      return TerrainType.FLAT;
    }
  }
  
  /**
   * Selects random coordinates from the world map
   * @param count Number of tiles to generate
   * @param excludeOcean Whether to exclude ocean tiles
   * @returns Array of coordinates and tile data
   */
  public randomTileGeneration(count: number, excludeOcean: boolean = true): TileData[] {
    const tiles: TileData[] = [];
    const selectedCoords = new Set<string>();
    
    // Ensure we have a world generator
    if (!this.worldGenerator) {
      console.error('World generator not available. Please initialize the world map first.');
      return [];
    }
    
    // Ensure we don't exceed the total number of possible tiles
    const maxTiles = Math.min(count, 100); // Limit to 100 tiles for safety
    const maxAttempts = maxTiles * 5; // Allow for some failed attempts
    let attempts = 0;
    
    // Try to generate the requested number of unique tiles
    while (tiles.length < maxTiles && attempts < maxAttempts) {
      attempts++;
      
      // Generate random coordinates
      const x = Math.floor(Math.random() * WORLD_GRID_WIDTH) - Math.floor(WORLD_GRID_WIDTH / 2);
      const y = Math.floor(Math.random() * WORLD_GRID_HEIGHT) - Math.floor(WORLD_GRID_HEIGHT / 2);
      
      // Create a unique key for these coordinates
      const coordKey = `${x},${y}`;
      
      // Skip if we've already selected these coordinates
      if (selectedCoords.has(coordKey)) {
        continue;
      }
      
      // Get actual tile data from the world generator
      try {
        const frontendBiomeType = this.worldGenerator.getBiome(x, y);
        
        // Skip ocean tiles if requested
        if (excludeOcean && (frontendBiomeType <= 2)) { // Ocean biomes
          continue;
        }
        
        // Get full tile data
        const elevation = this.worldGenerator.getElevation(x, y);
        const moisture = this.worldGenerator.getMoisture(x, y);
        const temperature = this.worldGenerator.getTemperature(x, y, elevation);
        const color = this.worldGenerator.getColorForMode(x, y, 'biome');
        
        // Map frontend biome type to backend biome type
        const biome = this.getBiomeTypeFromFrontendId(frontendBiomeType);
        
        // Determine terrain type based on elevation and biome
        const terrain = this.getTerrainTypeFromTileData(frontendBiomeType, elevation);
        
        // Add to our selections
        selectedCoords.add(coordKey);
        tiles.push({
          x,
          y,
          biome,
          terrain,
          color,
          elevation,
          moisture,
          temperature
        });
      } catch (error) {
        console.error(`Error getting tile data for coordinates (${x}, ${y}):`, error);
        continue;
      }
    }
    
    return tiles;
  }
  
  /**
   * Format tile data for the backend API
   * @param tiles Array of tile data
   * @returns Formatted data ready for the backend
   */
  public prepareForAuction(tiles: TileData[]): any[] {
    return tiles.map(tile => ({
      location: {
        x: tile.x,
        y: tile.y
      },
      biomeType: tile.biome,
      terrainType: tile.terrain,
      visualData: {
        color: {
          r: tile.color.r,
          g: tile.color.g,
          b: tile.color.b
        }
      },
      worldData: {
        elevation: tile.elevation,
        moisture: tile.moisture,
        temperature: {
          value: tile.temperature,
          baseValue: tile.temperature,
          regionalVariation: 0,
          elevationEffect: 0
        }
      }
    }));
  }
  
  /**
   * Send tile data to backend for generation
   * @param tiles Formatted tile data
   * @returns Promise with generated tiles
   */
  public async generateTiles(tiles: TileData[]): Promise<AuctionTile[]> {
    try {
      const formattedTiles = this.prepareForAuction(tiles);
      
      // Construct the complete payload
      const payload = {
        tiles: formattedTiles
      };
      
      // Log the complete payload for debugging
      console.log('Sending tile generation API request with payload:', JSON.stringify(payload, null, 2));
      
      // The API expects a { tiles: [...] } structure
      const response = await apiService.post<TileGenerationResponse>('/api/land/generate', payload);
      
      // If the response includes a success message, it worked
      if (response.message && response.message.includes('Successfully generated')) {
        console.log('Tile generation successful:', response.message);
        // Return the tiles array from the response
        return response.tiles || [];
      }
      
      // If no success message but we have tiles, that's still success
      if (response.tiles && response.tiles.length > 0) {
        return response.tiles;
      }
      
      // Otherwise we have an error
      throw new Error(response.message || 'Failed to generate tiles');
    } catch (error) {
      console.error('Error generating tiles:', error);
      throw error;
    }
  }

  /**
   * Check if a tile at specific coordinates exists in the database and is available
   * @param x X coordinate
   * @param y Y coordinate
   * @returns Promise with tile availability data
   */
  public async checkTileAvailability(x: number, y: number): Promise<{
    exists: boolean;
    owned: boolean;
    inAuction: boolean;
    owner?: string;
    auctionId?: string;
  }> {
    try {
      interface TileAvailabilityResponse {
        id?: string;
        owned: boolean;
        owner?: string;
        inAuction: boolean;
        auctionId?: string;
        coordinates: {
          x: number;
          y: number;
        };
      }
      
      const response = await apiService.get<TileAvailabilityResponse>(`/api/land/coordinates/${x}/${y}`);
      
      return {
        exists: !!response.id,
        owned: !!response.owned,
        inAuction: !!response.inAuction,
        owner: response.owner,
        auctionId: response.auctionId
      };
    } catch (error) {
      console.error('Error checking tile availability:', error);
      return {
        exists: false,
        owned: false,
        inAuction: false
      };
    }
  }
}

// Export as singleton
const tileGenerationService = new TileGenerationService();
export default tileGenerationService; 