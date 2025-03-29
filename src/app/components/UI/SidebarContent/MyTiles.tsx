import React, { useState } from "react";
import Image from "next/image";

interface Tile {
  id: number;
  name: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  location: string;
  acquired: string;
  resources: {
    type: string;
    amount: number;
    regeneration: string;
  }[];
  stats: {
    defense: number;
    income: number;
    resourceBonus: number;
  };
  image: string;
}

const MyTiles: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [activeTab, setActiveTab] = useState<"tiles" | "collection">("tiles");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Dummy tiles data
  const tiles: Tile[] = [
    {
      id: 1,
      name: "Home Base",
      type: "Grassland",
      rarity: "rare",
      location: "Region 3, Sector 2",
      acquired: "Initial Claim",
      resources: [
        { type: "Wood", amount: 25, regeneration: "10/day" },
        { type: "Food", amount: 40, regeneration: "15/day" },
      ],
      stats: {
        defense: 30,
        income: 15,
        resourceBonus: 20,
      },
      image: "/path/to/home-tile.png",
    },
    {
      id: 2,
      name: "Mining Outpost",
      type: "Mountain",
      rarity: "uncommon",
      location: "Region 5, Sector 1",
      acquired: "Purchased (350 coins)",
      resources: [
        { type: "Stone", amount: 50, regeneration: "20/day" },
        { type: "Ore", amount: 15, regeneration: "5/day" },
      ],
      stats: {
        defense: 40,
        income: 10,
        resourceBonus: 15,
      },
      image: "/path/to/mountain-tile.png",
    },
    {
      id: 3,
      name: "Trading Post",
      type: "Coast",
      rarity: "uncommon",
      location: "Region 2, Sector 4",
      acquired: "Quest Reward",
      resources: [
        { type: "Fish", amount: 30, regeneration: "12/day" },
        { type: "Gold", amount: 10, regeneration: "5/day" },
      ],
      stats: {
        defense: 20,
        income: 35,
        resourceBonus: 10,
      },
      image: "/path/to/coast-tile.png",
    },
    {
      id: 4,
      name: "Ancient Temple",
      type: "Special",
      rarity: "epic",
      location: "Region 1, Sector 3",
      acquired: "Quest Reward",
      resources: [
        { type: "Mana", amount: 45, regeneration: "15/day" },
        { type: "Artifacts", amount: 5, regeneration: "1/day" },
      ],
      stats: {
        defense: 50,
        income: 20,
        resourceBonus: 30,
      },
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

  const handleTileAction = (action: string) => {
    setSelectedAction(action);
    console.log(`Action ${action} on tile ${selectedTile?.name}`);
    // In a real app, you would handle the action here
    setTimeout(() => {
      setSelectedAction(null);
      // For demonstration purposes, let's close the tile details after the action
      if (action === "sell" || action === "trade") {
        setSelectedTile(null);
      }
    }, 1000);
  };

  return (
    <div className="font-pixel text-sm">
      <h1 className="pixel-heading text-xl mb-4">My Territory</h1>

      <div className="mb-6 flex">
        <button
          className={`flex-1 py-2 ${
            activeTab === "tiles"
              ? "bg-yellow-700 text-yellow-100"
              : "bg-yellow-200 text-yellow-900"
          }`}
          onClick={() => setActiveTab("tiles")}
        >
          My Tiles
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === "collection"
              ? "bg-yellow-700 text-yellow-100"
              : "bg-yellow-200 text-yellow-900"
          }`}
          onClick={() => setActiveTab("collection")}
        >
          Collection
        </button>
      </div>

      {selectedTile ? (
        <div className="pixel-panel">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg text-yellow-900">{selectedTile.name}</h2>
            <button
              className="bg-yellow-800 text-yellow-100 w-8 h-8 flex items-center justify-center"
              onClick={() => setSelectedTile(null)}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div
              className={`w-32 h-32 mx-auto md:mx-0 border-4 ${getRarityColor(
                selectedTile.rarity
              )}`}
            >
              <div
                className={`w-full h-full ${getTypeColor(
                  selectedTile.type
                )} flex items-center justify-center`}
              >
                <span className="text-yellow-900 text-xs">
                  {selectedTile.type}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-xs">Type:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedTile.type}
                </div>

                <div className="text-xs">Rarity:</div>
                <div className="text-yellow-900 text-xs capitalize">
                  {selectedTile.rarity}
                </div>

                <div className="text-xs">Location:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedTile.location}
                </div>

                <div className="text-xs">Acquired:</div>
                <div className="text-yellow-900 text-xs">
                  {selectedTile.acquired}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm text-yellow-900 mb-2">Resources</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedTile.resources.map((resource, idx) => (
                <div key={idx} className="pixel-panel bg-yellow-100/50">
                  <div className="text-yellow-900 text-xs font-bold mb-1">
                    {resource.type}
                  </div>
                  <div className="flex justify-between text-xxs">
                    <span>Amount:</span>
                    <span className="text-yellow-900">{resource.amount}</span>
                  </div>
                  <div className="flex justify-between text-xxs">
                    <span>Regen:</span>
                    <span className="text-yellow-900">
                      {resource.regeneration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm text-yellow-900 mb-2">Stats</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="pixel-panel bg-yellow-100/50">
                <div className="text-center text-xxs">Defense</div>
                <div className="text-center text-yellow-900 text-lg">
                  {selectedTile.stats.defense}
                </div>
              </div>
              <div className="pixel-panel bg-yellow-100/50">
                <div className="text-center text-xxs">Income</div>
                <div className="text-center text-yellow-900 text-lg">
                  {selectedTile.stats.income}
                </div>
              </div>
              <div className="pixel-panel bg-yellow-100/50">
                <div className="text-center text-xxs">Resource Bonus</div>
                <div className="text-center text-yellow-900 text-lg">
                  {selectedTile.stats.resourceBonus}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <button
              className={`pixel-button ${
                selectedAction === "upgrade" ? "bg-green-600 text-white" : ""
              }`}
              onClick={() => handleTileAction("upgrade")}
              disabled={selectedAction !== null}
            >
              {selectedAction === "upgrade" ? "Upgrading..." : "Upgrade"}
            </button>
            <button
              className={`pixel-button ${
                selectedAction === "harvest" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => handleTileAction("harvest")}
              disabled={selectedAction !== null}
            >
              {selectedAction === "harvest"
                ? "Harvesting..."
                : "Harvest Resources"}
            </button>
            <button
              className={`pixel-button ${
                selectedAction === "sell" ? "bg-red-500 text-white" : ""
              }`}
              onClick={() => handleTileAction("sell")}
              disabled={selectedAction !== null}
            >
              {selectedAction === "sell" ? "Selling..." : "Sell"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {activeTab === "tiles" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tiles.map((tile) => (
                <div
                  key={tile.id}
                  className="pixel-tile cursor-pointer"
                  onClick={() => setSelectedTile(tile)}
                >
                  <div className="flex mb-2">
                    <div
                      className={`w-16 h-16 border-2 ${getRarityColor(
                        tile.rarity
                      )}`}
                    >
                      <div
                        className={`w-full h-full ${getTypeColor(
                          tile.type
                        )} flex items-center justify-center`}
                      >
                        <span className="text-yellow-900 text-xxs">
                          {tile.type.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="text-yellow-900 mb-1 truncate">
                        {tile.name}
                      </div>
                      <div className="text-xxs mb-1 capitalize">
                        {tile.rarity}
                      </div>
                      <div className="text-yellow-900 text-xs truncate">
                        {tile.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xxs">
                    <span>Def: {tile.stats.defense}</span>
                    <span>Inc: {tile.stats.income}</span>
                    <span>Res: {tile.stats.resourceBonus}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center my-4 text-yellow-800">
              <p className="mb-4">Collection view coming soon!</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  "Grassland",
                  "Desert",
                  "Mountain",
                  "Coast",
                  "Forest",
                  "Special",
                ].map((type, idx) => (
                  <div key={idx} className="pixel-panel bg-yellow-100/50">
                    <div className="text-center text-xs mb-2">{type}</div>
                    <div className="w-12 h-12 mx-auto mb-2 border-2 border-yellow-800 bg-gray-200 flex items-center justify-center">
                      <span className="text-yellow-900 text-xs">?</span>
                    </div>
                    <div className="text-center text-xxs">Discovered: 0/10</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button className="pixel-button">Explore New Tiles</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTiles;
