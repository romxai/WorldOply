"use client";

import React, { useState } from "react";

// Sample marketplace listings
const mockListings = [
  {
    id: "listing-1",
    tileId: "tile-245",
    coordinates: { x: 214, y: 567 },
    biome: "Grassland",
    price: 320,
    seller: "GrasslandFarmer",
    listedAt: "2023-12-17T15:30:00Z",
    resources: ["Iron", "Coal"],
    description:
      "Prime grassland with valuable resource deposits. Perfect for farming or industrial use.",
    image: "https://via.placeholder.com/100/7CFC00/000000?text=Grass",
  },
  {
    id: "listing-2",
    tileId: "tile-876",
    coordinates: { x: 789, y: 123 },
    biome: "Temperate Forest",
    price: 450,
    seller: "ForestKeeper",
    listedAt: "2023-12-16T09:15:00Z",
    resources: ["Wood", "Berries"],
    description:
      "Beautiful temperate forest with abundant natural resources and wildlife.",
    image: "https://via.placeholder.com/100/228B22/FFFFFF?text=Forest",
  },
  {
    id: "listing-3",
    tileId: "tile-321",
    coordinates: { x: 456, y: 789 },
    biome: "Coastal",
    price: 780,
    seller: "SeaSide",
    listedAt: "2023-12-18T11:45:00Z",
    resources: ["Fish", "Salt"],
    description:
      "Stunning coastal property with access to deep sea fishing and beautiful views.",
    image: "https://via.placeholder.com/100/00BFFF/FFFFFF?text=Coast",
  },
  {
    id: "listing-4",
    tileId: "tile-159",
    coordinates: { x: 111, y: 222 },
    biome: "Mountains",
    price: 580,
    seller: "MountainClimber",
    listedAt: "2023-12-15T14:20:00Z",
    resources: ["Gold", "Stone"],
    description:
      "Mountainous terrain with significant gold deposits. Perfect for mining operations.",
    image: "https://via.placeholder.com/100/A0522D/FFFFFF?text=Mountain",
  },
  {
    id: "listing-5",
    tileId: "tile-753",
    coordinates: { x: 644, y: 199 },
    biome: "Savanna",
    price: 290,
    seller: "SafariGuide",
    listedAt: "2023-12-19T08:10:00Z",
    resources: ["Wood", "Herbs"],
    description:
      "Expansive savanna with unique herbs and wildlife. Excellent for conservation projects.",
    image: "https://via.placeholder.com/100/F4A460/FFFFFF?text=Savanna",
  },
];

export function MarketplaceSidebar() {
  const [selectedListing, setSelectedListing] = useState<
    (typeof mockListings)[0] | null
  >(null);
  const [filter, setFilter] = useState<string>("all");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePurchase = () => {
    // In a real app, this would send the purchase request to an API
    alert(
      `Purchased tile ${selectedListing?.tileId} for ${selectedListing?.price} credits`
    );
    setSelectedListing(null);
  };

  const filteredListings =
    filter === "all"
      ? mockListings
      : mockListings.filter((listing) =>
          listing.biome.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <div>
      {!selectedListing ? (
        // Listings view
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Marketplace</h3>
            <button className="px-3 py-1 bg-green-600 rounded-md text-sm">
              Sell Tile
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "all" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("all")}
            >
              All Biomes
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "forest" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("forest")}
            >
              Forest
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "mountain" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("mountain")}
            >
              Mountains
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "coastal" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("coastal")}
            >
              Coastal
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "grassland" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("grassland")}
            >
              Grassland
            </button>
          </div>

          {/* Listings */}
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-gray-600"
              onClick={() => setSelectedListing(listing)}
            >
              <div className="flex">
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={listing.image}
                    alt={listing.biome}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{listing.biome}</h4>
                    <span className="text-sm text-gray-400">
                      {formatDate(listing.listedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {listing.coordinates.x}, {listing.coordinates.y}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-lg font-bold text-green-400">
                      {listing.price}{" "}
                      <span className="text-xs text-gray-400">credits</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      by {listing.seller}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredListings.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No listings found with the selected filter.
            </div>
          )}
        </div>
      ) : (
        // Listing detail view
        <div>
          <button
            onClick={() => setSelectedListing(null)}
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
            Back to listings
          </button>

          <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
            <img
              src={selectedListing.image}
              alt={selectedListing.biome}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">
                  {selectedListing.biome} Tile
                </h3>
                <div className="text-gray-400 text-sm">
                  Listed on {formatDate(selectedListing.listedAt)}
                </div>
              </div>

              <p className="text-gray-300 mt-1 mb-3">
                {selectedListing.description}
              </p>

              <div className="bg-gray-800 p-2 rounded-md mb-3">
                <p className="text-blue-300 text-sm">
                  Coordinates: {selectedListing.coordinates.x},{" "}
                  {selectedListing.coordinates.y}
                </p>
              </div>

              <div className="mb-3">
                <h4 className="text-sm text-gray-400 mb-1">Resources:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedListing.resources.map((resource, index) => (
                    <span
                      key={index}
                      className="bg-gray-600 px-2 py-1 rounded-md text-xs"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-sm">Sold by:</div>
                <div className="ml-2 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center text-xs mr-1">
                    {selectedListing.seller.charAt(0)}
                  </div>
                  <span>{selectedListing.seller}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Price</p>
              <div className="text-2xl font-bold text-green-400">
                {selectedListing.price}{" "}
                <span className="text-sm text-gray-400">credits</span>
              </div>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={handlePurchase}
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
