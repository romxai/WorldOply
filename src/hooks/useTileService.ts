import { useState, useCallback } from 'react';
import tileService from '@/services/tileService';
import { TileOwnership, TileWithOwnership } from '@/types/auction';
import { Tile } from '@/types/tile';

export const useTileService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTileByCoordinates = useCallback(async (x: number, y: number): Promise<TileWithOwnership | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const baseTile = await tileService.getTileByCoordinates(x, y);
      const ownershipInfo = await tileService.getTileOwnership(baseTile.tileId);
      
      return {
        ...baseTile,
        coordinates: { x, y },
        ownership: ownershipInfo || {
          tileId: baseTile.tileId,
          inAuction: false
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tile info');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTileOwnership = useCallback(async (tileId: string): Promise<TileOwnership | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const ownership = await tileService.getTileOwnership(tileId);
      return ownership;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tile ownership');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimTile = useCallback(async (x: number, y: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await tileService.claimTile(x, y);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim tile');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getTileByCoordinates,
    getTileOwnership,
    claimTile
  };
}; 