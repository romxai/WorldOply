import React, { useEffect, useRef } from 'react';
import { AuctionItem } from '@/types/auction';

interface AuctionTileOverlayProps {
  auctions: AuctionItem[];
  tileSize: number;
  viewportWidth: number;
  viewportHeight: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
  startX: number;
  startY: number;
  enabled: boolean;
}

export const AuctionTileOverlay: React.FC<AuctionTileOverlayProps> = ({
  auctions,
  tileSize,
  viewportWidth,
  viewportHeight,
  offsetX,
  offsetY,
  zoom,
  startX,
  startY,
  enabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Function to draw the auction overlays
  const drawAuctionOverlays = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    if (auctions.length === 0) return;

    // Calculate tile size with zoom
    const currentTileSize = tileSize * zoom;

    // Create a map of tile coordinates to auction
    const auctionsByTile = new Map<string, AuctionItem>();
    auctions.forEach(auction => {
      auction.tiles.forEach(tile => {
        auctionsByTile.set(`${tile.x}-${tile.y}`, auction);
      });
    });

    // Animate based on timestamp (pulsing effect)
    const now = timestamp || performance.now();
    const pulse = Math.sin(now * 0.002) * 0.2 + 0.8; // Pulsing value between 0.6 and 1.0

    // Draw auction indicators
    auctionsByTile.forEach((auction, tileKey) => {
      const [x, y] = tileKey.split('-').map(Number);
      
      // Skip if the tile is not in the visible area
      if (x < startX || y < startY) return;
      
      // Calculate screen position
      const screenX = (x - startX) * currentTileSize - offsetX;
      const screenY = (y - startY) * currentTileSize - offsetY;
      
      // Skip if outside viewport
      if (
        screenX + currentTileSize < 0 || 
        screenY + currentTileSize < 0 || 
        screenX > viewportWidth || 
        screenY > viewportHeight
      ) return;

      // Draw different visualizations based on auction status
      if (auction.status === 'in-progress') {
        // Active auction - yellow pulsing highlight
        ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * pulse})`;
        ctx.fillRect(screenX, screenY, currentTileSize, currentTileSize);
        
        // Auction corner marker
        const markerSize = currentTileSize * 0.25;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.moveTo(screenX + currentTileSize, screenY);
        ctx.lineTo(screenX + currentTileSize, screenY + markerSize);
        ctx.lineTo(screenX + currentTileSize - markerSize, screenY);
        ctx.closePath();
        ctx.fill();
        
        // Show bid count if any
        if (auction.bids.length > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = `${Math.max(10, currentTileSize * 0.2)}px Arial`;
          ctx.fillText(
            `${auction.bids.length}`,
            screenX + currentTileSize - markerSize * 0.6,
            screenY + markerSize * 0.7
          );
        }
      } else if (auction.status === 'scheduled') {
        // Scheduled auction - blue indicator
        ctx.fillStyle = `rgba(0, 100, 255, ${0.3 * pulse})`;
        ctx.fillRect(screenX, screenY, currentTileSize, currentTileSize);
        
        // Scheduled corner marker
        const markerSize = currentTileSize * 0.25;
        ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(screenX + currentTileSize, screenY);
        ctx.lineTo(screenX + currentTileSize, screenY + markerSize);
        ctx.lineTo(screenX + currentTileSize - markerSize, screenY);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Request the next animation frame
    animationFrameRef.current = requestAnimationFrame(drawAuctionOverlays);
  };

  // Set up and clean up the animation loop
  useEffect(() => {
    if (!enabled) return;
    
    animationFrameRef.current = requestAnimationFrame(drawAuctionOverlays);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [auctions, tileSize, viewportWidth, viewportHeight, offsetX, offsetY, zoom, startX, startY, enabled]);

  // Render the canvas
  return enabled ? (
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
  ) : null;
}; 