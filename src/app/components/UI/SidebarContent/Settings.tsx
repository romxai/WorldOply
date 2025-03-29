import React, { useState } from "react";

const Settings: React.FC = () => {
  const [gameVolume, setGameVolume] = useState(75);
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(85);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [highGraphicsEnabled, setHighGraphicsEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [confirmReset, setConfirmReset] = useState(false);

  const handleVolumeChange = (type: string, value: number) => {
    switch (type) {
      case "game":
        setGameVolume(value);
        break;
      case "music":
        setMusicVolume(value);
        break;
      case "sfx":
        setSfxVolume(value);
        break;
    }
  };

  const handleResetSettings = () => {
    if (confirmReset) {
      // Reset all settings to defaults
      setGameVolume(75);
      setMusicVolume(50);
      setSfxVolume(85);
      setNotificationsEnabled(true);
      setAutoSaveEnabled(true);
      setHighGraphicsEnabled(true);
      setSelectedTheme("default");
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="font-pixel text-sm">
      <h1 className="pixel-heading text-xl mb-6">Game Settings</h1>

      <div className="space-y-6">
        <div className="pixel-panel">
          <h2 className="text-lg text-yellow-900 mb-4">Audio</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs">Game Volume</span>
                <span className="text-xs text-yellow-900">{gameVolume}%</span>
              </div>
              <div className="w-full h-4 bg-yellow-200 border-2 border-yellow-800 relative">
                <div
                  className="h-full bg-yellow-600"
                  style={{ width: `${gameVolume}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameVolume}
                  onChange={(e) =>
                    handleVolumeChange("game", parseInt(e.target.value))
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs">Music Volume</span>
                <span className="text-xs text-yellow-900">{musicVolume}%</span>
              </div>
              <div className="w-full h-4 bg-yellow-200 border-2 border-yellow-800 relative">
                <div
                  className="h-full bg-yellow-600"
                  style={{ width: `${musicVolume}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) =>
                    handleVolumeChange("music", parseInt(e.target.value))
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs">SFX Volume</span>
                <span className="text-xs text-yellow-900">{sfxVolume}%</span>
              </div>
              <div className="w-full h-4 bg-yellow-200 border-2 border-yellow-800 relative">
                <div
                  className="h-full bg-yellow-600"
                  style={{ width: `${sfxVolume}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={(e) =>
                    handleVolumeChange("sfx", parseInt(e.target.value))
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pixel-panel">
          <h2 className="text-lg text-yellow-900 mb-4">Gameplay</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs">Notifications</span>
              <button
                className={`w-12 h-6 relative ${
                  notificationsEnabled ? "bg-green-500" : "bg-red-500"
                } border-2 border-yellow-800`}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 bg-yellow-100 border border-yellow-800 transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs">Auto-Save Game</span>
              <button
                className={`w-12 h-6 relative ${
                  autoSaveEnabled ? "bg-green-500" : "bg-red-500"
                } border-2 border-yellow-800`}
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 bg-yellow-100 border border-yellow-800 transition-transform ${
                    autoSaveEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs">High Graphics Mode</span>
              <button
                className={`w-12 h-6 relative ${
                  highGraphicsEnabled ? "bg-green-500" : "bg-red-500"
                } border-2 border-yellow-800`}
                onClick={() => setHighGraphicsEnabled(!highGraphicsEnabled)}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 bg-yellow-100 border border-yellow-800 transition-transform ${
                    highGraphicsEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        <div className="pixel-panel">
          <h2 className="text-lg text-yellow-900 mb-4">Visual Theme</h2>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {["default", "dark", "retro", "fantasy", "cyberpunk", "pastel"].map(
              (theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`py-2 border-2 capitalize ${
                    selectedTheme === theme
                      ? "bg-yellow-600 text-white border-yellow-800"
                      : "bg-yellow-100 text-yellow-900 border-yellow-400"
                  }`}
                >
                  <span className="text-xs">{theme}</span>
                </button>
              )
            )}
          </div>

          <div className="text-center text-xxs text-yellow-800">
            Some themes require a game restart
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            className="pixel-button bg-yellow-800 text-yellow-100"
            onClick={handleResetSettings}
          >
            {confirmReset ? "Confirm Reset" : "Reset to Default"}
          </button>
          <button
            className="pixel-button"
            onClick={() => console.log("Saving settings")}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
