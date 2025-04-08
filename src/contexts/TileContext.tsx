'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { tileAPI } from '../services/apiService';
import { BiomeType, RGB } from '../app/components/WorldGenerator/config';

// Interface for tile data from backend after saving
export interface SavedTile {
  id: string;
  location: {
    x: number;
    y: number;
  };
  biomeType: BiomeType;
  owner?: string;
  worldData: {
    seed: number;
    elevation: number;
    moisture: number;
    temperature: {
      value: number;
      baseValue: number;
      regionalVariation: number;
      elevationEffect: number;
    };
    visualData: {
      color: RGB;
    };
  };
  resources?: any[];  // Will be expanded later based on resource types
  auctionId?: string;
  marketplaceListingId?: string;
  lastUpdated?: string;
}

// Context interface
interface TileContextType {
  // Highlighted tile (when hovering)
  highlightedTile: { x: number, y: number } | null;
  highlightTile: (x: number, y: number) => void;
  clearHighlight: () => void;
  
  // Selected tile (when clicked)
  selectedTile: { x: number, y: number } | null;
  selectTile: (x: number, y: number) => void;
  clearSelection: () => void;
  
  // Saved tile data from backend
  savedTiles: Map<string, SavedTile>;
  getSavedTile: (x: number, y: number) => SavedTile | undefined;
  fetchTileData: (id: string) => Promise<SavedTile | null>;
  
  // Camera control for zooming to specific tile
  zoomToTile: (x: number, y: number, zoom?: number) => void;
  onZoomToTile?: (callback: (x: number, y: number, zoom?: number) => void) => void;
}

// Create context
const TileContext = createContext<TileContextType | undefined>(undefined);

// Provider component
export const TileProvider = ({ children }: { children: ReactNode }) => {
  // State for highlighted and selected tiles
  const [highlightedTile, setHighlightedTile] = useState<{ x: number, y: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number, y: number } | null>(null);
  
  // State for saved tile data
  const [savedTiles, setSavedTiles] = useState<Map<string, SavedTile>>(new Map());
  
  // Callback for zooming to tile
  const [zoomCallback, setZoomCallback] = useState<((x: number, y: number, zoom?: number) => void) | undefined>(undefined);
  
  // Helper for creating tile key
  const getTileKey = (x: number, y: number): string => `${x},${y}`;
  
  // Highlight a tile (hover)
  const highlightTile = useCallback((x: number, y: number) => {
    setHighlightedTile({ x, y });
  }, []);
  
  // Clear highlighted tile
  const clearHighlight = useCallback(() => {
    setHighlightedTile(null);
  }, []);
  
  // Select a tile (click)
  const selectTile = useCallback((x: number, y: number) => {
    setSelectedTile({ x, y });
  }, []);
  
  // Clear selected tile
  const clearSelection = useCallback(() => {
    setSelectedTile(null);
  }, []);
  
  // Get saved tile data
  const getSavedTile = useCallback((x: number, y: number): SavedTile | undefined => {
    return savedTiles.get(getTileKey(x, y));
  }, [savedTiles]);
  
  // Fetch tile data from backend
  const fetchTileData = useCallback(async (id: string): Promise<SavedTile | null> => {
    try {
      const tileData = await tileAPI.getTileById(id);
      
      // Add to saved tiles map
      setSavedTiles(prev => {
        const newMap = new Map(prev);
        const key = getTileKey(tileData.location.x, tileData.location.y);
        newMap.set(key, tileData);
        return newMap;
      });
      
      return tileData;
    } catch (error) {
      console.error('Error fetching tile data:', error);
      return null;
    }
  }, []);
  
  // Zoom to specific tile
  const zoomToTile = useCallback((x: number, y: number, zoom?: number) => {
    if (zoomCallback) {
      zoomCallback(x, y, zoom);
    }
  }, [zoomCallback]);
  
  // Set callback for zoom
  const onZoomToTile = useCallback((callback: (x: number, y: number, zoom?: number) => void) => {
    setZoomCallback(() => callback);
  }, []);
  
  // Context value
  const value = {
    highlightedTile,
    highlightTile,
    clearHighlight,
    selectedTile,
    selectTile,
    clearSelection,
    savedTiles,
    getSavedTile,
    fetchTileData,
    zoomToTile,
    onZoomToTile,
  };
  
  return <TileContext.Provider value={value}>{children}</TileContext.Provider>;
};

// Custom hook to use the tile context
export const useTileContext = () => {
  const context = useContext(TileContext);
  if (context === undefined) {
    throw new Error('useTileContext must be used within a TileProvider');
  }
  return context;
}; 