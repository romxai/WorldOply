"use client";

import React, { useState } from "react";

// Sample auction data
const mockAuctions = [
  {
    id: "auction-1",
    tileId: "tile-789",
    coordinates: { x: 356, y: 125 },
    biome: "Tropical Rainforest",
    currentBid: 450,
    bidCount: 12,
    endsAt: new Date(Date.now() + 3600000 * 5).toISOString(), // 5 hours from now
    bidders: 8,
    seller: "WorldBuilder99",
    topBidder: "BiomeCollector",
    featured: true,
    image: "https://via.placeholder.com/100/228B22/FFFFFF?text=Forest",
  },
  {
    id: "auction-2",
    tileId: "tile-423",
    coordinates: { x: 124, y: 675 },
    biome: "Desert",
    currentBid: 280,
    bidCount: 5,
    endsAt: new Date(Date.now() + 3600000 * 12).toISOString(), // 12 hours from now
    bidders: 4,
    seller: "DesertKing",
    topBidder: "LandHoarder",
    featured: false,
    image: "https://via.placeholder.com/100/F4A460/FFFFFF?text=Desert",
  },
  {
    id: "auction-3",
    tileId: "tile-582",
    coordinates: { x: 895, y: 312 },
    biome: "Tundra",
    currentBid: 670,
    bidCount: 24,
    endsAt: new Date(Date.now() + 3600000 * 2).toISOString(), // 2 hours from now
    bidders: 15,
    seller: "NorthernTrader",
    topBidder: "IceCollector",
    featured: true,
    image: "https://via.placeholder.com/100/E0FFFF/000000?text=Tundra",
  },
  {
    id: "auction-4",
    tileId: "tile-126",
    coordinates: { x: 442, y: 511 },
    biome: "Ocean",
    currentBid: 190,
    bidCount: 3,
    endsAt: new Date(Date.now() + 3600000 * 8).toISOString(), // 8 hours from now
    bidders: 2,
    seller: "SeaExplorer",
    topBidder: "CoralFarmer",
    featured: false,
    image: "https://via.placeholder.com/100/1E90FF/FFFFFF?text=Ocean",
  },
  {
    id: "auction-5",
    tileId: "tile-897",
    coordinates: { x: 678, y: 234 },
    biome: "Mountains",
    currentBid: 820,
    bidCount: 18,
    endsAt: new Date(Date.now() + 3600000 * 1).toISOString(), // 1 hour from now
    bidders: 10,
    seller: "PeakTrader",
    topBidder: "MountainClimber",
    featured: true,
    image: "https://via.placeholder.com/100/808080/FFFFFF?text=Mountains",
  },
];

export function AuctionsSidebar() {
  const [selectedAuction, setSelectedAuction] = useState<
    (typeof mockAuctions)[0] | null
  >(null);
  const [bidAmount, setBidAmount] = useState<number>(0);

  // Format time remaining
  const formatTimeRemaining = (dateString: string) => {
    const endTime = new Date(dateString).getTime();
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleBid = () => {
    // In a real app, this would send the bid to an API
    alert(`Bid placed for ${bidAmount} on auction ${selectedAuction?.id}`);
    // Reset selection and amount after bid
    setSelectedAuction(null);
    setBidAmount(0);
  };

  return (
    <div>
      {!selectedAuction ? (
        // List of auctions
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Active Auctions</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 rounded-md text-sm">
                My Bids
              </button>
              <button className="px-3 py-1 bg-green-600 rounded-md text-sm">
                Create
              </button>
            </div>
          </div>

          {mockAuctions.map((auction) => (
            <div
              key={auction.id}
              className={`bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-gray-600 ${
                auction.featured ? "border-l-4 border-yellow-500" : ""
              }`}
              onClick={() => setSelectedAuction(auction)}
            >
              <div className="flex">
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={auction.image}
                    alt={auction.biome}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{auction.biome}</h4>
                      <p className="text-xs text-gray-400">
                        Tile coordinates: {auction.coordinates.x},{" "}
                        {auction.coordinates.y}
                      </p>
                    </div>
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">
                      {formatTimeRemaining(auction.endsAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-lg font-bold text-green-400">
                      {auction.currentBid}{" "}
                      <span className="text-xs text-gray-400">credits</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {auction.bidCount} bids
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Auction detail view
        <div>
          <button
            onClick={() => setSelectedAuction(null)}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to auctions
          </button>

          <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
            <img
              src={selectedAuction.image}
              alt={selectedAuction.biome}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">
                  {selectedAuction.biome} Tile
                </h3>
                <div className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-sm">
                  {formatTimeRemaining(selectedAuction.endsAt)}
                </div>
              </div>

              <p className="text-gray-400 mt-1">
                Coordinates: {selectedAuction.coordinates.x},{" "}
                {selectedAuction.coordinates.y}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Seller</p>
                  <p>{selectedAuction.seller}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Bidder</p>
                  <p>{selectedAuction.topBidder}</p>
                </div>
                <div>
                  <p className="text-gray-400">Bid Count</p>
                  <p>{selectedAuction.bidCount} bids</p>
                </div>
                <div>
                  <p className="text-gray-400">Unique Bidders</p>
                  <p>{selectedAuction.bidders} bidders</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {selectedAuction.currentBid}{" "}
                  <span className="text-sm text-gray-400">credits</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Minimum bid: {selectedAuction.currentBid + 10} credits
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">Place a Bid</h4>
            <div className="flex mb-4">
              <input
                type="number"
                value={bidAmount || ""}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={selectedAuction.currentBid + 10}
                placeholder={`${selectedAuction.currentBid + 10} or more`}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!bidAmount || bidAmount <= selectedAuction.currentBid}
                onClick={handleBid}
              >
                Bid
              </button>
            </div>

            <div className="text-sm text-gray-400">
              <p>• Your bid is binding and cannot be canceled</p>
              <p>• You will be notified if someone outbids you</p>
              <p>
                • Auction ends in {formatTimeRemaining(selectedAuction.endsAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
