import React, { useState } from "react";
import Image from "next/image";

interface AuctionItem {
  id: number;
  name: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  currentBid: number;
  minBid: number;
  timeLeft: string;
  bids: number;
  image: string;
}

const Auction: React.FC = () => {
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(
    null
  );
  const [bidAmount, setBidAmount] = useState<number>(0);

  // Dummy auction data
  const auctions: AuctionItem[] = [
    {
      id: 1,
      name: "Forest Clearing",
      type: "Grassland",
      rarity: "uncommon",
      currentBid: 250,
      minBid: 275,
      timeLeft: "2h 15m",
      bids: 5,
      image: "/path/to/grassland-tile.png", // Use a colored div as fallback
    },
    {
      id: 2,
      name: "Mountain Peak",
      type: "Mountain",
      rarity: "rare",
      currentBid: 500,
      minBid: 550,
      timeLeft: "4h 30m",
      bids: 8,
      image: "/path/to/mountain-tile.png",
    },
    {
      id: 3,
      name: "Desert Oasis",
      type: "Desert",
      rarity: "epic",
      currentBid: 750,
      minBid: 800,
      timeLeft: "1h 45m",
      bids: 12,
      image: "/path/to/desert-tile.png",
    },
    {
      id: 4,
      name: "Coastal Bay",
      type: "Coast",
      rarity: "uncommon",
      currentBid: 300,
      minBid: 325,
      timeLeft: "5h 20m",
      bids: 3,
      image: "/path/to/coast-tile.png",
    },
    {
      id: 5,
      name: "Ancient Ruins",
      type: "Special",
      rarity: "legendary",
      currentBid: 1200,
      minBid: 1250,
      timeLeft: "3h 10m",
      bids: 15,
      image: "/path/to/special-tile.png",
    },
  ];

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "bg-gray-400 border-gray-600";
      case "uncommon":
        return "bg-green-500 border-green-700";
      case "rare":
        return "bg-blue-500 border-blue-700";
      case "epic":
        return "bg-purple-500 border-purple-700";
      case "legendary":
        return "bg-yellow-500 border-yellow-700";
      default:
        return "bg-gray-400 border-gray-600";
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "Grassland":
        return "bg-green-400";
      case "Mountain":
        return "bg-gray-400";
      case "Desert":
        return "bg-yellow-300";
      case "Coast":
        return "bg-blue-300";
      case "Special":
        return "bg-purple-300";
      default:
        return "bg-gray-300";
    }
  };

  const handleBid = (auction: AuctionItem) => {
    console.log(`Bid ${bidAmount} on ${auction.name}`);
    // Here you would typically handle the bid submission
    setSelectedAuction(null);
  };

  const handleAuctionClick = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    setBidAmount(auction.minBid);
  };

  return (
    <div className="font-pixel text-sm">
      <h1 className="pixel-heading text-xl mb-6">Auction House</h1>

      {selectedAuction ? (
        <div className="pixel-panel">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg text-yellow-900">{selectedAuction.name}</h2>
            <button
              className="bg-yellow-800 text-yellow-100 w-8 h-8 flex items-center justify-center"
              onClick={() => setSelectedAuction(null)}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div
              className={`w-32 h-32 mx-auto md:mx-0 border-4 ${getRarityColor(
                selectedAuction.rarity
              )}`}
            >
              <div
                className={`w-full h-full ${getTypeColor(
                  selectedAuction.type
                )} flex items-center justify-center`}
              >
                <span className="text-yellow-900 text-xs">
                  {selectedAuction.type}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">Type:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedAuction.type}
                </div>

                <div className="text-xs">Rarity:</div>
                <div className="text-yellow-900 text-xs capitalize">
                  {selectedAuction.rarity}
                </div>

                <div className="text-xs">Current Bid:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedAuction.currentBid} coins
                </div>

                <div className="text-xs">Time Left:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedAuction.timeLeft}
                </div>

                <div className="text-xs">Bids:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedAuction.bids}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-center mb-2">Place Your Bid</div>
            <div className="flex items-center justify-between">
              <button
                className="pixel-button text-sm w-8 h-8 p-0 flex items-center justify-center"
                onClick={() =>
                  setBidAmount((prev) =>
                    Math.max(selectedAuction.minBid, prev - 25)
                  )
                }
              >
                -
              </button>
              <div className="pixel-panel flex-1 mx-2 text-center">
                {bidAmount} coins
              </div>
              <button
                className="pixel-button text-sm w-8 h-8 p-0 flex items-center justify-center"
                onClick={() => setBidAmount((prev) => prev + 25)}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <button
              className="pixel-button bg-red-500 text-white"
              onClick={() => setSelectedAuction(null)}
            >
              Cancel
            </button>
            <button
              className="pixel-button"
              onClick={() => handleBid(selectedAuction)}
            >
              Place Bid
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="pixel-tile cursor-pointer"
                onClick={() => handleAuctionClick(auction)}
              >
                <div className="flex mb-2">
                  <div
                    className={`w-16 h-16 border-2 ${getRarityColor(
                      auction.rarity
                    )}`}
                  >
                    <div
                      className={`w-full h-full ${getTypeColor(
                        auction.type
                      )} flex items-center justify-center`}
                    >
                      <span className="text-yellow-900 text-xxs">
                        {auction.type.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="text-yellow-900 mb-1 truncate">
                      {auction.name}
                    </div>
                    <div className="text-xxs mb-1 capitalize">
                      {auction.rarity}
                    </div>
                    <div className="text-yellow-900 text-xs">
                      {auction.currentBid} coins
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xxs">
                  <span>{auction.timeLeft} left</span>
                  <span>{auction.bids} bids</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button className="pixel-button">My Bids</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auction;
