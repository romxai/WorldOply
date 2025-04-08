"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import WorldMap from "../components/WorldGenerator/WorldMap";
import AuthButton from "../components/UI/AuthButton";
import OnlineCounter from "../components/UI/OnlineCounter";
import ConnectionStatus from "../components/UI/ConnectionStatus";

// Sidebar imports
import Sidebar, { SidebarType } from "../components/UI/Sidebar";

export default function Game() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState<SidebarType>(null);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 768 });

  // Set window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Initial setup
    updateDimensions();
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Handle sidebar toggle
  const handleSidebarToggle = (type: SidebarType) => {
    if (sidebarType === type && sidebarOpen) {
      setSidebarOpen(false);
    } else {
      setSidebarType(type);
      setSidebarOpen(true);
    }
  };

  // If loading or no user, show loading screen
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-white relative">
      {/* Top navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-2">
        <AuthButton />
        <OnlineCounter />
      </div>

      {/* Game menu */}
      <div className="absolute top-16 left-4 z-10 flex flex-col gap-2">
        <button 
          onClick={() => handleSidebarToggle("profile")}
          className="bg-amber-700 text-white px-3 py-2 rounded-md shadow-md font-pixel text-sm"
        >
          Profile
        </button>
        <button 
          onClick={() => handleSidebarToggle("myTiles")}
          className="bg-amber-700 text-white px-3 py-2 rounded-md shadow-md font-pixel text-sm"
        >
          My Lands
        </button>
        <button 
          onClick={() => handleSidebarToggle("marketplace")}
          className="bg-amber-700 text-white px-3 py-2 rounded-md shadow-md font-pixel text-sm"
        >
          Market
        </button>
        <button 
          onClick={() => handleSidebarToggle("auction")}
          className="bg-amber-700 text-white px-3 py-2 rounded-md shadow-md font-pixel text-sm"
        >
          Auctions
        </button>
        <button 
          onClick={() => handleSidebarToggle("settings")}
          className="bg-amber-700 text-white px-3 py-2 rounded-md shadow-md font-pixel text-sm"
        >
          Settings
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        sidebarType={sidebarType || "profile"}
        onClose={() => setSidebarOpen(false)}
      />

      {/* World Map */}
      <div className="flex-1 overflow-hidden">
        <WorldMap 
          width={dimensions.width} 
          height={dimensions.height} 
        />
      </div>
    </main>
  );
} 