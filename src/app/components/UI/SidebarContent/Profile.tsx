import React from "react";
import Image from "next/image";

const Profile: React.FC = () => {
  // Dummy user data
  const user = {
    username: "PixelAdventurer",
    level: 42,
    joined: "2023-06-15",
    coins: 1250,
    gems: 75,
    experience: 8750,
    nextLevelXp: 10000,
    ownedTiles: 28,
    avatar: "/assets/avatar-placeholder.png", // If not available, use a simple div with text
  };

  return (
    <div className="font-pixel text-xs">
      <h1 className="pixel-heading text-sm mb-4">User Profile</h1>

      <div className="pixel-panel mb-4 p-3">
        <div className="flex items-center gap-3">
          {/* Avatar - placeholder with initials if no image */}
          <div className="w-16 h-16 bg-yellow-200 border-2 border-yellow-800 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-yellow-800">
              {user.username.charAt(0)}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <h2 className="text-xs text-yellow-900 mb-1 truncate">
              {user.username}
            </h2>

            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <span className="text-xxs">LVL</span>
                <span className="text-xs text-yellow-900">{user.level}</span>
              </div>
            </div>

            <div className="h-3 w-full bg-yellow-200 border-1 border-yellow-800 relative">
              <div
                className="h-full bg-green-600"
                style={{
                  width: `${(user.experience / user.nextLevelXp) * 100}%`,
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xxs text-yellow-900">
                {user.experience}/{user.nextLevelXp}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="pixel-panel p-2">
          <h3 className="text-center text-yellow-900 text-xxs mb-2">
            Resources
          </h3>
          <div className="flex justify-between">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-yellow-400 border-1 border-yellow-800 mb-1"></div>
              <span className="text-xxs text-yellow-900">{user.coins}</span>
              <span className="text-xxs text-yellow-700">Coins</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-purple-400 border-1 border-purple-800 mb-1"></div>
              <span className="text-xxs text-yellow-900">{user.gems}</span>
              <span className="text-xxs text-yellow-700">Gems</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-green-400 border-1 border-green-800 mb-1"></div>
              <span className="text-xxs text-yellow-900">
                {user.ownedTiles}
              </span>
              <span className="text-xxs text-yellow-700">Tiles</span>
            </div>
          </div>
        </div>

        <div className="pixel-panel p-2">
          <h3 className="text-center text-yellow-900 text-xxs mb-2">Stats</h3>
          <div className="text-xxs space-y-1">
            <div className="flex justify-between">
              <span>Joined:</span>
              <span className="text-yellow-900">{user.joined}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiles Owned:</span>
              <span className="text-yellow-900">{user.ownedTiles}</span>
            </div>
            <div className="flex justify-between">
              <span>Rank:</span>
              <span className="text-yellow-900">Adventurer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pixel-panel mb-4 p-2">
        <h3 className="text-center text-yellow-900 text-xxs mb-2">
          Achievements
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 mb-1 ${
                  i < 3 ? "bg-yellow-500" : "bg-gray-400"
                } border-1 border-yellow-800`}
              ></div>
              <span className="text-xxs text-center text-yellow-900">
                {i < 3 ? "Unlocked" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button className="pixel-button text-xxs py-1 px-2">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
