import React, { useState } from 'react';
import CreateAuctionModal from './CreateAuctionModal';

interface CreateAuctionButtonProps {
  selectedTiles: Array<{ x: number; y: number; info: string }>;
}

/**
 * Button component that opens the auction creation modal
 */
const CreateAuctionButton: React.FC<CreateAuctionButtonProps> = ({ selectedTiles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (selectedTiles.length === 0) {
      alert('Please select at least one tile first by clicking on the map.');
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        data-testid="create-auction-button"
      >
        Create Auction with Selected Tiles
      </button>
      
      {isModalOpen && (
        <CreateAuctionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedTiles={selectedTiles}
        />
      )}
    </>
  );
};

export default CreateAuctionButton; 