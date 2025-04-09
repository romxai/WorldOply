import React, { useState } from "react";
import Image from "next/image";
import Sidebar, { SidebarType } from "./Sidebar";

// SVG icon components
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AuctionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const MarketplaceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"></path>
  </svg>
);

const TilesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const DockItem: React.FC<DockItemProps> = ({ icon, label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative dock-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap dock-tooltip shadow-md">
          {label}
        </div>
      )}
      <div
        className="relative flex items-center justify-center cursor-pointer"
        onClick={() => {
          onClick();
          console.log(`${label} clicked`);
        }}
      >
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 dock-frame bg-gray-800 rounded-lg">
          <Image
            src="/assets/frame.png"
            alt="Frame"
            fill
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center text-white dock-icon shadow-md">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dock: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>(null);

  const openSidebar = (type: SidebarType) => {
    setActiveSidebar(type);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const dockItems = [
    {
      icon: <ProfileIcon />,
      label: "User Profile",
      onClick: () => openSidebar("profile"),
    },
    {
      icon: <ChatIcon />,
      label: "Global Chat",
      onClick: () => openSidebar("chat"),
    },
    {
      icon: <AuctionIcon />,
      label: "Auction House",
      onClick: () => openSidebar("auction"),
    },
    {
      icon: <MarketplaceIcon />,
      label: "Marketplace",
      onClick: () => openSidebar("marketplace"),
    },
    {
      icon: <TilesIcon />,
      label: "My Tiles",
      onClick: () => openSidebar("myTiles"),
    },
    {
      icon: <SettingsIcon />,
      label: "Settings",
      onClick: () => openSidebar("settings"),
    },
    {
      icon: <LogoutIcon />,
      label: "Logout",
      onClick: () => openSidebar("logout"),
    },
  ];

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 px-2">
        <div className="flex items-center justify-center rounded-lg">
          <div className="flex flex-wrap sm:flex-nowrap justify-center">
            {dockItems.map((item, index) => (
              <DockItem
                key={index}
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
              />
            ))}
          </div>
        </div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        sidebarType={activeSidebar} 
        onClose={closeSidebar} 
      />
    </>
  );
};

export default Dock;
