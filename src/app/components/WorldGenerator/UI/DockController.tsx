"use client";

import React, { useState } from "react";
import { Dock, DockItem } from "./Dock";
import { Sidebar, Modal } from "./Sidebar";
import { ProfileSidebar } from "./SidebarContents/ProfileSidebar";
import { AuctionsSidebar } from "./SidebarContents/AuctionsSidebar";
import { MarketplaceSidebar } from "./SidebarContents/MarketplaceSidebar";
import { MyTilesSidebar } from "./SidebarContents/MyTilesSidebar";
import { SettingsSidebar } from "./SidebarContents/SettingsSidebar";

// Icons for the dock
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
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
    className="w-full h-full"
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
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

const MyTilesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-5z"></path>
    <path d="M20.5 10H19V8.5h1.5V10z"></path>
    <path d="M4.5 22c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-5z"></path>
    <path d="M10.5 22H9v-1.5h1.5V22z"></path>
    <path d="M4.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-5z"></path>
    <path d="M10.5 10H9V8.5h1.5V10z"></path>
    <path d="M14.5 22c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-5z"></path>
    <path d="M20.5 22H19v-1.5h1.5V22z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
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
    className="w-full h-full"
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

export function DockController() {
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Handler for dock item clicks
  const handleDockItemClick = (id: string) => {
    if (id === "logout") {
      setIsLogoutModalOpen(true);
      return;
    }

    // Toggle sidebar if already active, otherwise open the new sidebar
    setActiveSidebar((prev) => (prev === id ? null : id));
  };

  // Handler for sidebar close
  const handleCloseSidebar = () => {
    setActiveSidebar(null);
  };

  // Handler for logout confirmation
  const handleLogout = () => {
    // In a real app, this would handle the logout process
    alert("Logged out successfully");
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      {/* Dock */}
      <Dock onIconClick={handleDockItemClick} activeSidebar={activeSidebar}>
        <DockItem
          id="profile"
          icon={<ProfileIcon />}
          label="Profile"
          onClick={handleDockItemClick}
          isActive={activeSidebar === "profile"}
        />
        <DockItem
          id="auctions"
          icon={<AuctionIcon />}
          label="Auctions"
          onClick={handleDockItemClick}
          isActive={activeSidebar === "auctions"}
        />
        <DockItem
          id="marketplace"
          icon={<MarketplaceIcon />}
          label="Marketplace"
          onClick={handleDockItemClick}
          isActive={activeSidebar === "marketplace"}
        />
        <DockItem
          id="mytiles"
          icon={<MyTilesIcon />}
          label="My Tiles"
          onClick={handleDockItemClick}
          isActive={activeSidebar === "mytiles"}
        />
        <DockItem
          id="settings"
          icon={<SettingsIcon />}
          label="Settings"
          onClick={handleDockItemClick}
          isActive={activeSidebar === "settings"}
        />
        <DockItem
          id="logout"
          icon={<LogoutIcon />}
          label="Logout"
          onClick={handleDockItemClick}
        />
      </Dock>

      {/* Sidebar content based on active sidebar */}
      <Sidebar
        isOpen={activeSidebar === "profile"}
        onClose={handleCloseSidebar}
        title="Profile"
      >
        <ProfileSidebar />
      </Sidebar>

      <Sidebar
        isOpen={activeSidebar === "auctions"}
        onClose={handleCloseSidebar}
        title="Auctions"
      >
        <AuctionsSidebar />
      </Sidebar>

      <Sidebar
        isOpen={activeSidebar === "marketplace"}
        onClose={handleCloseSidebar}
        title="Marketplace"
      >
        <MarketplaceSidebar />
      </Sidebar>

      <Sidebar
        isOpen={activeSidebar === "mytiles"}
        onClose={handleCloseSidebar}
        title="My Tiles"
      >
        <MyTilesSidebar />
      </Sidebar>

      <Sidebar
        isOpen={activeSidebar === "settings"}
        onClose={handleCloseSidebar}
        title="Settings"
      >
        <SettingsSidebar />
      </Sidebar>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        actions={
          <>
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to logout? Any unsaved changes will be lost.
        </p>
      </Modal>
    </>
  );
}
