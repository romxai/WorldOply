import React, { useEffect, useRef } from 'react';
import { TileWithOwnership } from '@/types/auction';

interface WorldMapOverlayProps {
  tiles: Map<string, TileWithOwnership> | undefined;
  tileSize: number;
  viewportWidth: number;
  viewportHeight: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export const WorldMapOverlay: React.FC<WorldMapOverlayProps> = ({
  tiles,
  tileSize,
  viewportWidth,
  viewportHeight,
  offsetX,
  offsetY,
  zoom
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Set up the canvas transform
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);

    // Draw overlays for each tile
    if (tiles && tiles.size > 0) {
      tiles.forEach((tile, key) => {
        const { coordinates, ownership } = tile;
        const x = coordinates.x * tileSize;
        const y = coordinates.y * tileSize;

        // Skip if tile is not owned or in auction
        if (!ownership) return;

        // Draw ownership indicator
        if (ownership.ownerId) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'; // Green for owned tiles
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
          ctx.strokeRect(x, y, tileSize, tileSize);
        }

        // Draw auction indicator
        if (ownership.inAuction) {
          // Draw auction marker in the corner
          const markerSize = tileSize * 0.3;
          ctx.fillStyle = 'rgba(255, 215, 0, 0.6)'; // Gold for auction
          ctx.beginPath();
          ctx.moveTo(x + tileSize, y);
          ctx.lineTo(x + tileSize, y + markerSize);
          ctx.lineTo(x + tileSize - markerSize, y);
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    ctx.restore();
  }, [tiles, tileSize, viewportWidth, viewportHeight, offsetX, offsetY, zoom]);

  return (
    <canvas
      ref={canvasRef}
      width={viewportWidth}
      height={viewportHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: viewportWidth,
        height: viewportHeight
      }}
    />
  );
}; 