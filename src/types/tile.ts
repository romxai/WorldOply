export interface Tile {
  tileId: string;
  coordinates: {
    x: number;
    y: number;
  };
  biome: string;
  elevation: number;
  temperature: number;
  moisture: number;
  resources: {
    type: string;
    amount: number;
  }[];
} 