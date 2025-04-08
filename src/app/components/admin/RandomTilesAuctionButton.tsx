import React, { useState } from 'react';
import { getRandomTiles } from '../../../utils/tileSelectionUtils';
import CreateAuctionModal from './CreateAuctionModal';

/**
 * Button component that generates random tiles and opens the auction creation modal
 */
const RandomTilesAuctionButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [randomTiles, setRandomTiles] = useState<Array<{ x: number; y: number; info: string }>>([]);

  const handleClick = () => {
    // Since we can't directly access the world generator here, 
    // we'll create mock tiles with random coordinates
    
    // In a real implementation, this would use the worldGenerator instance
    // For now, create a simple mock worldGenerator with minimum required methods
    const mockWorldGenerator = {
      getBiome: (x: number, y: number) => {
        const biomes = ['grassland', 'forest', 'plains', 'desert', 'hills', 'mountains'];
        return biomes[Math.floor(Math.random() * biomes.length)];
      },
      getElevation: () => {
        // Return a value between 0 and 1
        return Math.random();
      },
      getMoisture: () => {
        // Return a value between 0 and 1
        return Math.random();
      },
      getTemperature: (x: number, y: number, elevation: number) => {
        // Return a value between 0 and 30 (Celsius)
        return Math.random() * 30;
      }
    };
    
    // Generate 10 random tiles centered around a reasonable coordinate
    const centerX = 500 + Math.floor(Math.random() * 100);
    const centerY = 500 + Math.floor(Math.random() * 100);
    
    const tiles = getRandomTiles(mockWorldGenerator, 10, centerX, centerY, 20);
    setRandomTiles(tiles);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRandomTiles([]);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        data-testid="random-tiles-button"
      >
        Create Auction with Random Tiles
      </button>
      
      {isModalOpen && (
        <CreateAuctionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedTiles={randomTiles}
        />
      )}
    </>
  );
};

export default RandomTilesAuctionButton; 