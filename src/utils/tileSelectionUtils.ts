/**
 * Utility functions for tile selection
 */

import { BiomeType } from '../app/components/WorldGenerator/config';

/**
 * Get random tiles from the world map
 * @param worldGenerator The world generator instance
 * @param count Number of tiles to select
 * @param startX Starting X coordinate area
 * @param startY Starting Y coordinate area
 * @param radius Radius around the starting point to sample from
 * @returns Array of selected tiles with coordinates and info
 */
export function getRandomTiles(
  worldGenerator: any,
  count: number = 10,
  startX: number = 500,
  startY: number = 500,
  radius: number = 20
): Array<{ x: number; y: number; info: string }> {
  const selectedTiles: Array<{ x: number; y: number; info: string }> = [];
  const selectedCoords = new Set<string>();
  
  // Ensure count is reasonable
  const actualCount = Math.min(Math.max(1, count), 50);
  
  // Try to find enough unique tiles
  let attempts = 0;
  const maxAttempts = actualCount * 5; // Limit attempts to avoid infinite loop
  
  while (selectedTiles.length < actualCount && attempts < maxAttempts) {
    attempts++;
    
    // Generate random coordinates within the radius
    const offsetX = Math.floor(Math.random() * (radius * 2)) - radius;
    const offsetY = Math.floor(Math.random() * (radius * 2)) - radius;
    
    const x = startX + offsetX;
    const y = startY + offsetY;
    
    // Skip if we've already selected this tile
    const coordKey = `${x},${y}`;
    if (selectedCoords.has(coordKey)) {
      continue;
    }
    
    // Get tile info from the world generator
    const biome = worldGenerator.getBiome(x, y);
    const elevation = worldGenerator.getElevation(x, y);
    const moisture = worldGenerator.getMoisture(x, y);
    const temperature = worldGenerator.getTemperature(x, y, elevation);
    
    // Skip water tiles if desired
    // if (biome === BiomeType.OCEAN || biome === BiomeType.SHALLOW_WATER) {
    //   continue;
    // }
    
    // Format the tile info
    const info = `Biome: ${biome}\nCoordinates: (${x}, ${y})\nElevation: ${elevation.toFixed(3)}\nMoisture: ${moisture.toFixed(3)}\nTemperature: ${temperature.toFixed(3)}`;
    
    // Add to selected tiles
    selectedTiles.push({ x, y, info });
    selectedCoords.add(coordKey);
  }
  
  return selectedTiles;
}

/**
 * Get tiles in a specific pattern (e.g., line, square, etc.)
 * @param worldGenerator The world generator instance
 * @param pattern Pattern type ('line', 'square', 'cross')
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param size Size of the pattern
 * @returns Array of selected tiles with coordinates and info
 */
export function getTilesInPattern(
  worldGenerator: any,
  pattern: 'line' | 'square' | 'cross' = 'square',
  centerX: number = 500,
  centerY: number = 500,
  size: number = 3
): Array<{ x: number; y: number; info: string }> {
  const selectedTiles: Array<{ x: number; y: number; info: string }> = [];
  const selectedCoords = new Set<string>();
  
  // Ensure size is reasonable
  const actualSize = Math.min(Math.max(1, size), 10);
  
  // Generate coordinates based on pattern
  let coordinates: Array<[number, number]> = [];
  
  switch (pattern) {
    case 'line':
      // Horizontal line
      for (let i = 0; i < actualSize; i++) {
        coordinates.push([centerX + i, centerY]);
      }
      break;
      
    case 'square':
      // Square pattern
      for (let i = 0; i < actualSize; i++) {
        for (let j = 0; j < actualSize; j++) {
          coordinates.push([
            centerX + i - Math.floor(actualSize / 2),
            centerY + j - Math.floor(actualSize / 2)
          ]);
        }
      }
      break;
      
    case 'cross':
      // Cross pattern
      for (let i = -Math.floor(actualSize / 2); i <= Math.floor(actualSize / 2); i++) {
        coordinates.push([centerX + i, centerY]); // Horizontal
        coordinates.push([centerX, centerY + i]); // Vertical
      }
      // Remove duplicated center
      coordinates = coordinates.filter((c, index) => {
        const key = `${c[0]},${c[1]}`;
        return index === coordinates.findIndex(coord => `${coord[0]},${coord[1]}` === key);
      });
      break;
  }
  
  // Process coordinates and get tile info
  for (const [x, y] of coordinates) {
    const coordKey = `${x},${y}`;
    if (selectedCoords.has(coordKey)) {
      continue;
    }
    
    // Get tile info
    const biome = worldGenerator.getBiome(x, y);
    const elevation = worldGenerator.getElevation(x, y);
    const moisture = worldGenerator.getMoisture(x, y);
    const temperature = worldGenerator.getTemperature(x, y, elevation);
    
    // Format the tile info
    const info = `Biome: ${biome}\nCoordinates: (${x}, ${y})\nElevation: ${elevation.toFixed(3)}\nMoisture: ${moisture.toFixed(3)}\nTemperature: ${temperature.toFixed(3)}`;
    
    // Add to selected tiles
    selectedTiles.push({ x, y, info });
    selectedCoords.add(coordKey);
  }
  
  return selectedTiles;
} 