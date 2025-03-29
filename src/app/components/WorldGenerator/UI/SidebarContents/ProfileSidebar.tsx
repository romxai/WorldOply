"use client";

import React from "react";

// Sample profile data (replace with real data in production)
const mockProfile = {
  id: "user-123",
  username: "WorldOply_Explorer",
  avatar: "https://via.placeholder.com/150",
  joinDate: "2023-06-15",
  level: 42,
  xp: 8750,
  xpToNextLevel: 10000,
  stats: {
    tilesOwned: 156,
    auctionsWon: 23,
    totalSales: 78,
    reputation: 4.8,
  },
  bio: "Passionate world builder and explorer. I specialize in creating beautiful mountain ranges and coastal regions.",
  achievements: [
    {
      id: 1,
      name: "First Purchase",
      description: "Bought your first tile",
      date: "2023-06-20",
    },
    {
      id: 2,
      name: "Land Baron",
      description: "Own 100+ tiles",
      date: "2023-09-12",
    },
    {
      id: 3,
      name: "Entrepreneur",
      description: "Sold 50+ tiles",
      date: "2023-11-05",
    },
  ],
};

export function ProfileSidebar() {
  return (
    <div className="text-white space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={mockProfile.avatar}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-800"></div>
        </div>
        <div>
          <h3 className="text-xl font-bold">{mockProfile.username}</h3>
          <p className="text-gray-400 text-sm">
            Member since {new Date(mockProfile.joinDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Level {mockProfile.level}</span>
          <span className="text-sm text-gray-400">
            {mockProfile.xp}/{mockProfile.xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-gray-600 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full"
            style={{
              width: `${(mockProfile.xp / mockProfile.xpToNextLevel) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-400 text-xs uppercase mb-1">Tiles Owned</h4>
          <p className="text-xl font-semibold">
            {mockProfile.stats.tilesOwned}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-400 text-xs uppercase mb-1">Auctions Won</h4>
          <p className="text-xl font-semibold">
            {mockProfile.stats.auctionsWon}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-400 text-xs uppercase mb-1">Total Sales</h4>
          <p className="text-xl font-semibold">
            {mockProfile.stats.totalSales}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-400 text-xs uppercase mb-1">Reputation</h4>
          <div className="flex items-center">
            <p className="text-xl font-semibold">
              {mockProfile.stats.reputation}
            </p>
            <div className="flex text-yellow-400 ml-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill={
                    i < Math.floor(mockProfile.stats.reputation)
                      ? "currentColor"
                      : "none"
                  }
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">About Me</h3>
        <p className="text-gray-300">{mockProfile.bio}</p>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="font-semibold mb-3">Recent Achievements</h3>
        <div className="space-y-3">
          {mockProfile.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gray-700 p-3 rounded-lg flex items-center space-x-3"
            >
              <div className="bg-yellow-500 bg-opacity-20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">{achievement.name}</h4>
                <p className="text-sm text-gray-400">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="pt-4 border-t border-gray-700">
        <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
