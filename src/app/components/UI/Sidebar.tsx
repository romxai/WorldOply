import React, { useState, useEffect } from "react";
import Image from "next/image";
import Profile from "./SidebarContent/Profile";
import Auction from "./SidebarContent/Auction";
import Marketplace from "./SidebarContent/Marketplace";
import MyTiles from "./SidebarContent/MyTiles";
import Settings from "./SidebarContent/Settings";
import Logout from "./SidebarContent/Logout";

export type SidebarType =
  | "profile"
  | "auction"
  | "marketplace"
  | "myTiles"
  | "settings"
  | "logout"
  | null;

interface SidebarProps {
  isOpen: boolean;
  sidebarType: SidebarType;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, sidebarType, onClose }) => {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAnimationClass("translate-x-0");
    } else {
      setAnimationClass("-translate-x-full");
    }
  }, [isOpen]);

  const renderContent = () => {
    switch (sidebarType) {
      case "profile":
        return <Profile />;
      case "auction":
        return <Auction />;
      case "marketplace":
        return <Marketplace />;
      case "myTiles":
        return <MyTiles />;
      case "settings":
        return <Settings />;
      case "logout":
        return <Logout onConfirm={onClose} />;
      default:
        return null;
    }
  };

  if (!isOpen && animationClass === "-translate-x-full") return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`relative w-80 md:w-96 h-full flex-shrink-0 transition-transform duration-300 ease-in-out ${animationClass}`}
      >
        <div className="relative h-full w-full">
          <Image
            src="/assets/page.png"
            alt="Sidebar Background"
            fill
            className="object-cover"
            priority
          />

          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-brown-800 rounded-md pixel-border"
            onClick={onClose}
          >
            <span className="font-pixel text-xl text-yellow-100">×</span>
          </button>

          {/* Content */}
          <div className="absolute inset-0 p-6 overflow-y-auto pixel-scroll">
            <div className="relative z-10 text-brown-900">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
