import React, { useState, useEffect } from "react";
import Image from "next/image";
import Profile from "./SidebarContent/Profile";
import Auction from "./SidebarContent/Auction";
import Marketplace from "./SidebarContent/Marketplace";
import MyLands from "./SidebarContent/MyLands";
import Settings from "./SidebarContent/Settings";
import Logout from "./SidebarContent/Logout";
import Chat from "./SidebarContent/Chat";

export type SidebarType =
  | "profile"
  | "auction"
  | "marketplace"
  | "myTiles"
  | "settings"
  | "logout"
  | "chat"
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
        return <MyLands />;
      case "settings":
        return <Settings />;
      case "logout":
        return <Logout onConfirm={onClose} />;
      case "chat":
        return <Chat isVisible={true} />;
      default:
        return null;
    }
  };

  if (!isOpen && animationClass === "-translate-x-full") return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`relative w-80 md:w-96 h-full flex-shrink-0 transition-transform duration-300 ease-in-out ${animationClass}`}
      >
        <div className="relative h-full w-full overflow-hidden">
          {/* Background image with preserved jagged edges */}
          <div className="absolute inset-0 flex">
            <Image
              src="/assets/page.png"
              alt="Sidebar Background"
              fill
              className="object-fill"
              priority
              style={{ objectPosition: "left" }}
            />
          </div>

          {/* Close button */}
          <button
            className="absolute top-6 right-4 z-10 w-8 h-8 flex items-center justify-center bg-yellow-800 rounded-md pixel-border"
            onClick={onClose}
          >
            <span className="font-pixel text-xl text-yellow-100 leading-none">
              ×
            </span>
          </button>

          {/* Content */}
          <div className="absolute inset-0 px-5 py-15 overflow-y-auto pixel-scroll">
            <div className="relative z-10 text-yellow-900">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
