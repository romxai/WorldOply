import React, { useState } from "react";
import Image from "next/image";

interface MarketItem {
  id: number;
  name: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  price: number;
  seller: string;
  listedDate: string;
  image: string;
  description: string;
}

const Marketplace: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Dummy market data
  const marketItems: MarketItem[] = [
    {
      id: 1,
      name: "Fertile Plains",
      type: "Grassland",
      rarity: "common",
      price: 150,
      seller: "TileTrader42",
      listedDate: "2 days ago",
      image: "/path/to/grassland-tile.png",
      description: "A wide-open grassy plain, perfect for farming or ranching.",
    },
    {
      id: 2,
      name: "Rocky Highlands",
      type: "Mountain",
      rarity: "uncommon",
      price: 350,
      seller: "MountainMaster",
      listedDate: "1 day ago",
      image: "/path/to/mountain-tile.png",
      description:
        "A hilly region with stone outcroppings, rich in mineral deposits.",
    },
    {
      id: 3,
      name: "Scorching Dunes",
      type: "Desert",
      rarity: "rare",
      price: 500,
      seller: "SandSeeker",
      listedDate: "3 days ago",
      image: "/path/to/desert-tile.png",
      description:
        "A vast desert with shifting sands, hiding ancient treasures beneath.",
    },
    {
      id: 4,
      name: "Calm Shoreline",
      type: "Coast",
      rarity: "uncommon",
      price: 300,
      seller: "WaveWatcher",
      listedDate: "5 hours ago",
      image: "/path/to/coast-tile.png",
      description:
        "A peaceful coastal area with sandy beaches and gentle waves.",
    },
    {
      id: 5,
      name: "Mystical Grove",
      type: "Special",
      rarity: "epic",
      price: 800,
      seller: "EnchantedExplorer",
      listedDate: "1 hour ago",
      image: "/path/to/special-tile.png",
      description:
        "A magical forest glade where strange creatures are said to dwell.",
    },
    {
      id: 6,
      name: "Deep Canyon",
      type: "Mountain",
      rarity: "rare",
      price: 450,
      seller: "CliffClimber",
      listedDate: "4 days ago",
      image: "/path/to/mountain-tile.png",
      description:
        "A deep ravine cutting through rocky terrain, with hidden caves.",
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

  const handlePurchase = (item: MarketItem) => {
    console.log(`Purchased ${item.name} for ${item.price} coins`);
    setSelectedItem(null);
  };

  const filteredItems = marketItems
    .filter(
      (item) =>
        filter === "all" || item.type.toLowerCase() === filter.toLowerCase()
    )
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="font-pixel text-xs">
      <h1 className="pixel-heading text-sm mb-3">Marketplace</h1>

      {selectedItem ? (
        <div className="pixel-panel p-3">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs text-yellow-900 font-bold">
              {selectedItem.name}
            </h2>
            <button
              className="bg-yellow-800 text-yellow-100 w-5 h-5 flex items-center justify-center"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div
              className={`w-24 h-24 mx-auto sm:mx-0 border-2 ${getRarityColor(
                selectedItem.rarity
              )}`}
            >
              <div
                className={`w-full h-full ${getTypeColor(
                  selectedItem.type
                )} flex items-center justify-center`}
              >
                <span className="text-yellow-900 text-xxs">
                  {selectedItem.type}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-1 text-xxs mb-2">
                <div>Type:</div>
                <div className="text-yellow-900">{selectedItem.type}</div>

                <div>Rarity:</div>
                <div className="text-yellow-900 capitalize">
                  {selectedItem.rarity}
                </div>

                <div>Seller:</div>
                <div className="text-yellow-900">{selectedItem.seller}</div>

                <div>Listed:</div>
                <div className="text-yellow-900">{selectedItem.listedDate}</div>
              </div>

              <div className="text-xxs mb-1">Description:</div>
              <div className="text-yellow-900 text-xxs border-1 border-yellow-800 p-1 mb-2 bg-yellow-100/50">
                {selectedItem.description}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-bold text-xs text-yellow-900">
              {selectedItem.price} coins
            </div>
            <button
              className="pixel-button text-xxs py-1 px-2"
              onClick={() => handlePurchase(selectedItem)}
            >
              Purchase
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="pixel-panel mb-3 p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tiles..."
                className="w-full p-1 border-1 border-yellow-800 font-pixel text-xxs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border-1 border-yellow-800 p-1 font-pixel text-xxs bg-yellow-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="grassland">Grassland</option>
              <option value="mountain">Mountain</option>
              <option value="desert">Desert</option>
              <option value="coast">Coast</option>
              <option value="special">Special</option>
            </select>
          </div>

          <div className="space-y-2 mb-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-2 border-2 border-yellow-800 bg-yellow-100/50 cursor-pointer hover:bg-yellow-200/50 transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 border-1 ${getRarityColor(
                      item.rarity
                    )}`}
                  >
                    <div
                      className={`w-full h-full ${getTypeColor(
                        item.type
                      )} flex items-center justify-center`}
                    >
                      <span className="text-yellow-900 text-xxs">
                        {item.type.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="ml-2 flex-1 overflow-hidden">
                    <div className="flex justify-between">
                      <div className="text-yellow-900 text-xxs font-bold truncate mr-1">
                        {item.name}
                        <span className="ml-1 text-xxs opacity-70 capitalize">
                          ({item.rarity})
                        </span>
                      </div>
                      <div className="text-yellow-900 text-xxs font-bold flex-shrink-0">
                        {item.price}c
                      </div>
                    </div>

                    <div className="flex justify-between text-xxs">
                      <span className="opacity-70">Seller: {item.seller}</span>
                      <span className="opacity-70">{item.listedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center text-yellow-800 my-3 text-xxs">
              No matching tiles found. Try adjusting your search.
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button className="pixel-button text-xxs py-1 px-2">
              My Listings
            </button>
            <button className="pixel-button text-xxs py-1 px-2">
              Sell Tile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
