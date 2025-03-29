"use client";

import React, { useState } from "react";

// Sample settings structure
const initialSettings = {
  display: {
    showGrid: true,
    showCoordinates: true,
    showResourceIcons: true,
    mapDetailLevel: "high", // low, medium, high
    tileHighlightColor: "#3498db",
    nightMode: false,
  },
  performance: {
    renderDistance: 3, // 1-5
    animationLevel: "high", // low, medium, high
    autosaveInterval: 5, // in minutes
  },
  notifications: {
    auctionAlerts: true,
    marketplaceAlerts: true,
    neighborAlerts: true,
    systemAlerts: true,
    soundEffects: true,
    notificationVolume: 70, // 0-100
  },
  gameplay: {
    autoClaimResources: true,
    confirmTilePurchases: true,
    tutorialMode: false,
    showTipOfTheDay: true,
  },
};

export function SettingsSidebar() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<
    "display" | "performance" | "notifications" | "gameplay"
  >("display");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleToggleSetting = (
    category: keyof typeof settings,
    setting: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
    setSaveStatus("Unsaved changes");
  };

  const handleSelectChange = (
    category: keyof typeof settings,
    setting: string,
    value: string | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setSaveStatus("Unsaved changes");
  };

  const handleRangeChange = (
    category: keyof typeof settings,
    setting: string,
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setSaveStatus("Unsaved changes");
  };

  const handleColorChange = (
    category: keyof typeof settings,
    setting: string,
    color: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: color,
      },
    }));
    setSaveStatus("Unsaved changes");
  };

  const saveSettings = () => {
    // In a real app, this would save settings to a backend or localStorage
    setSaveStatus("Settings saved!");
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setSaveStatus("Settings reset to default");
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  return (
    <div className="text-white">
      {/* Tabs navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        {(Object.keys(settings) as Array<keyof typeof settings>).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium text-sm capitalize ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {/* Display settings */}
        {activeTab === "display" && (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <h3 className="font-medium mb-2">Map Display</h3>

              <div className="flex items-center justify-between">
                <label htmlFor="showGrid" className="cursor-pointer">
                  Show Grid
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.display.showGrid ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  onClick={() => handleToggleSetting("display", "showGrid")}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.display.showGrid ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="showCoordinates" className="cursor-pointer">
                  Show Coordinates
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.display.showCoordinates
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("display", "showCoordinates")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.display.showCoordinates ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="showResourceIcons" className="cursor-pointer">
                  Show Resource Icons
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.display.showResourceIcons
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("display", "showResourceIcons")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.display.showResourceIcons ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="nightMode" className="cursor-pointer">
                  Night Mode
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.display.nightMode ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  onClick={() => handleToggleSetting("display", "nightMode")}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.display.nightMode ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="mapDetailLevel" className="block">
                  Map Detail Level
                </label>
                <select
                  id="mapDetailLevel"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  value={settings.display.mapDetailLevel}
                  onChange={(e) =>
                    handleSelectChange(
                      "display",
                      "mapDetailLevel",
                      e.target.value
                    )
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="tileHighlightColor" className="block">
                  Tile Highlight Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    id="tileHighlightColor"
                    value={settings.display.tileHighlightColor}
                    onChange={(e) =>
                      handleColorChange(
                        "display",
                        "tileHighlightColor",
                        e.target.value
                      )
                    }
                    className="rounded"
                  />
                  <span>{settings.display.tileHighlightColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance settings */}
        {activeTab === "performance" && (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="font-medium mb-2">Performance</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="renderDistance">
                    Render Distance: {settings.performance.renderDistance}
                  </label>
                  <span className="text-sm text-gray-400">
                    {settings.performance.renderDistance <= 2
                      ? "Faster"
                      : settings.performance.renderDistance >= 4
                      ? "Higher Quality"
                      : "Balanced"}
                  </span>
                </div>
                <input
                  type="range"
                  id="renderDistance"
                  min="1"
                  max="5"
                  step="1"
                  value={settings.performance.renderDistance}
                  onChange={(e) =>
                    handleRangeChange(
                      "performance",
                      "renderDistance",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full appearance-none bg-gray-600 h-2 rounded-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="animationLevel" className="block">
                  Animation Level
                </label>
                <select
                  id="animationLevel"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  value={settings.performance.animationLevel}
                  onChange={(e) =>
                    handleSelectChange(
                      "performance",
                      "animationLevel",
                      e.target.value
                    )
                  }
                >
                  <option value="low">Low (Better Performance)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Better Visuals)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="autosaveInterval" className="block">
                  Autosave Interval (minutes)
                </label>
                <select
                  id="autosaveInterval"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  value={settings.performance.autosaveInterval}
                  onChange={(e) =>
                    handleSelectChange(
                      "performance",
                      "autosaveInterval",
                      parseInt(e.target.value)
                    )
                  }
                >
                  <option value="1">1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notification settings */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <h3 className="font-medium mb-2">Notifications</h3>

              <div className="flex items-center justify-between">
                <label htmlFor="auctionAlerts" className="cursor-pointer">
                  Auction Alerts
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications.auctionAlerts
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("notifications", "auctionAlerts")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.notifications.auctionAlerts
                        ? "translate-x-6"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="marketplaceAlerts" className="cursor-pointer">
                  Marketplace Alerts
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications.marketplaceAlerts
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("notifications", "marketplaceAlerts")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.notifications.marketplaceAlerts
                        ? "translate-x-6"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="neighborAlerts" className="cursor-pointer">
                  Neighbor Alerts
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications.neighborAlerts
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("notifications", "neighborAlerts")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.notifications.neighborAlerts
                        ? "translate-x-6"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="systemAlerts" className="cursor-pointer">
                  System Alerts
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications.systemAlerts
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("notifications", "systemAlerts")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.notifications.systemAlerts ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="soundEffects" className="cursor-pointer">
                  Sound Effects
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications.soundEffects
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("notifications", "soundEffects")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.notifications.soundEffects ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="notificationVolume">
                    Volume: {settings.notifications.notificationVolume}%
                  </label>
                </div>
                <input
                  type="range"
                  id="notificationVolume"
                  min="0"
                  max="100"
                  step="5"
                  disabled={!settings.notifications.soundEffects}
                  value={settings.notifications.notificationVolume}
                  onChange={(e) =>
                    handleRangeChange(
                      "notifications",
                      "notificationVolume",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full appearance-none bg-gray-600 h-2 rounded-full ${
                    !settings.notifications.soundEffects ? "opacity-50" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Gameplay settings */}
        {activeTab === "gameplay" && (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <h3 className="font-medium mb-2">Gameplay</h3>

              <div className="flex items-center justify-between">
                <label htmlFor="autoClaimResources" className="cursor-pointer">
                  Auto-claim Resources
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.gameplay.autoClaimResources
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("gameplay", "autoClaimResources")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.gameplay.autoClaimResources
                        ? "translate-x-6"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirmTilePurchases"
                  className="cursor-pointer"
                >
                  Confirm Tile Purchases
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.gameplay.confirmTilePurchases
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("gameplay", "confirmTilePurchases")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.gameplay.confirmTilePurchases
                        ? "translate-x-6"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="tutorialMode" className="cursor-pointer">
                  Tutorial Mode
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.gameplay.tutorialMode
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("gameplay", "tutorialMode")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.gameplay.tutorialMode ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="showTipOfTheDay" className="cursor-pointer">
                  Show Tip of the Day
                </label>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.gameplay.showTipOfTheDay
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    handleToggleSetting("gameplay", "showTipOfTheDay")
                  }
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.gameplay.showTipOfTheDay ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with save/reset buttons */}
      <div className="mt-6 flex justify-between items-center">
        {saveStatus && (
          <span
            className={`text-sm ${
              saveStatus === "Settings saved!"
                ? "text-green-400"
                : "text-blue-400"
            }`}
          >
            {saveStatus}
          </span>
        )}
        <div className="flex gap-3 ml-auto">
          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
          >
            Reset
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
