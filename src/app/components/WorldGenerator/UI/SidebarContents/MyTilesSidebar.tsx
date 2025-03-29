"use client";

import React, { useState } from "react";

// Sample owned tiles data
const mockOwnedTiles = [
  {
    id: "tile-512",
    coordinates: { x: 345, y: 678 },
    biome: "Temperate Forest",
    acquiredDate: "2023-10-15T08:45:00Z",
    value: 420,
    resources: ["Wood", "Herbs", "Game"],
    neighbors: 4,
    developmentLevel: 2,
    isListed: false,
    image: "https://via.placeholder.com/100/228B22/FFFFFF?text=Forest",
  },
  {
    id: "tile-287",
    coordinates: { x: 346, y: 678 },
    biome: "Temperate Forest",
    acquiredDate: "2023-10-15T08:46:00Z",
    value: 380,
    resources: ["Wood", "Herbs"],
    neighbors: 4,
    developmentLevel: 1,
    isListed: false,
    image: "https://via.placeholder.com/100/228B22/FFFFFF?text=Forest",
  },
  {
    id: "tile-624",
    coordinates: { x: 892, y: 145 },
    biome: "Mountains",
    acquiredDate: "2023-09-03T14:30:00Z",
    value: 670,
    resources: ["Stone", "Iron", "Gold"],
    neighbors: 2,
    developmentLevel: 3,
    isListed: false,
    image: "https://via.placeholder.com/100/A0522D/FFFFFF?text=Mountain",
  },
  {
    id: "tile-189",
    coordinates: { x: 456, y: 321 },
    biome: "Desert",
    acquiredDate: "2023-11-21T10:15:00Z",
    value: 280,
    resources: ["Sand", "Oil"],
    neighbors: 1,
    developmentLevel: 0,
    isListed: true,
    listedPrice: 350,
    image: "https://via.placeholder.com/100/F4A460/FFFFFF?text=Desert",
  },
  {
    id: "tile-763",
    coordinates: { x: 123, y: 789 },
    biome: "Coastal",
    acquiredDate: "2023-08-17T16:20:00Z",
    value: 520,
    resources: ["Fish", "Salt", "Sand"],
    neighbors: 3,
    developmentLevel: 2,
    isListed: false,
    image: "https://via.placeholder.com/100/00BFFF/FFFFFF?text=Coast",
  },
];

export function MyTilesSidebar() {
  const [selectedTile, setSelectedTile] = useState<
    (typeof mockOwnedTiles)[0] | null
  >(null);
  const [filter, setFilter] = useState<string>("all");
  const [listingPrice, setListingPrice] = useState<number>(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleListTile = () => {
    // In a real app, this would send the listing request to an API
    alert(`Listed tile ${selectedTile?.id} for ${listingPrice} credits`);
    setSelectedTile(null);
  };

  const handleDevelopTile = () => {
    // In a real app, this would send the development request to an API
    alert(`Started development on tile ${selectedTile?.id}`);
    setSelectedTile(null);
  };

  const filteredTiles =
    filter === "all"
      ? mockOwnedTiles
      : filter === "listed"
      ? mockOwnedTiles.filter((tile) => tile.isListed)
      : mockOwnedTiles.filter((tile) =>
          tile.biome.toLowerCase().includes(filter.toLowerCase())
        );

  // Development level descriptions
  const developmentLevels = [
    "Undeveloped",
    "Basic Development",
    "Standard Development",
    "Advanced Development",
    "Full Development",
  ];

  return (
    <div>
      {!selectedTile ? (
        // Tiles list view
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">My Tiles</h3>
            <div className="text-sm text-gray-400">
              Total: {mockOwnedTiles.length} tiles
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "all" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filter === "listed" ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setFilter("listed")}
            >
              Listed
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
          </div>

          {/* Tiles grid */}
          <div className="grid grid-cols-2 gap-3">
            {filteredTiles.map((tile) => (
              <div
                key={tile.id}
                className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-gray-600"
                onClick={() => setSelectedTile(tile)}
              >
                <div className="relative">
                  <img
                    src={tile.image}
                    alt={tile.biome}
                    className="w-full h-20 object-cover"
                  />
                  {tile.isListed && (
                    <div className="absolute top-1 right-1 bg-green-600 text-xs px-2 py-0.5 rounded-full">
                      For Sale
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{tile.biome}</h4>
                    <div className="text-xs text-gray-400">
                      {developmentLevels[tile.developmentLevel].split(" ")[0]}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {tile.coordinates.x}, {tile.coordinates.y}
                  </p>
                  <div className="text-sm font-semibold text-green-400">
                    {tile.isListed ? tile.listedPrice : tile.value}{" "}
                    <span className="text-xs text-gray-400">credits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTiles.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No tiles found with the selected filter.
            </div>
          )}
        </div>
      ) : (
        // Tile detail view
        <div>
          <button
            onClick={() => setSelectedTile(null)}
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
            Back to my tiles
          </button>

          <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
            <img
              src={selectedTile.image}
              alt={selectedTile.biome}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{selectedTile.biome} Tile</h3>
                <div className="text-gray-400 text-sm">
                  Acquired {formatDate(selectedTile.acquiredDate)}
                </div>
              </div>

              <div className="bg-gray-800 p-2 rounded-md my-3">
                <p className="text-blue-300 text-sm">
                  Coordinates: {selectedTile.coordinates.x},{" "}
                  {selectedTile.coordinates.y}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-800 p-2 rounded-md">
                  <p className="text-gray-400 text-xs">Estimated Value</p>
                  <p className="text-green-400 font-bold">
                    {selectedTile.value} credits
                  </p>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <p className="text-gray-400 text-xs">Neighbors</p>
                  <p className="font-medium">{selectedTile.neighbors} tiles</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-md col-span-2">
                  <p className="text-gray-400 text-xs">Development</p>
                  <div className="mt-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${(selectedTile.developmentLevel / 4) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1">
                    {developmentLevels[selectedTile.developmentLevel]}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-sm text-gray-400 mb-1">Resources:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTile.resources.map((resource, index) => (
                    <span
                      key={index}
                      className="bg-gray-600 px-2 py-1 rounded-md text-xs"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!selectedTile.isListed ? (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium mb-2">List on Marketplace</h4>
                  <div className="flex mb-2">
                    <input
                      type="number"
                      value={listingPrice || ""}
                      onChange={(e) => setListingPrice(Number(e.target.value))}
                      min={selectedTile.value}
                      placeholder={`${selectedTile.value} or more`}
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        !listingPrice || listingPrice < selectedTile.value * 0.8
                      }
                      onClick={handleListTile}
                    >
                      List
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Recommended price: {selectedTile.value} -{" "}
                    {Math.round(selectedTile.value * 1.5)} credits
                  </p>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedTile.developmentLevel >= 4
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={selectedTile.developmentLevel >= 4}
                  onClick={handleDevelopTile}
                >
                  {selectedTile.developmentLevel >= 4
                    ? "Fully Developed"
                    : `Develop (${
                        (selectedTile.developmentLevel + 1) * 100
                      } credits)`}
                </button>

                <button className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors">
                  Visit Tile
                </button>
              </>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="mb-2">This tile is currently listed for sale</p>
                <p className="text-xl font-bold text-green-400 mb-4">
                  {selectedTile.listedPrice} credits
                </p>
                <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
                  Cancel Listing
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
