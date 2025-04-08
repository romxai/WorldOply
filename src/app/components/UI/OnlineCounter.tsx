'use client';

import React, { useEffect, useState } from 'react';
import realtimeService from '../../../services/realtimeService';

const OnlineCounter: React.FC = () => {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(realtimeService.isConnected());
    };
    
    // Set up the player count callback
    realtimeService.onPlayerCountUpdate((count) => {
      setPlayerCount(count);
    });
    
    // Initial check
    checkConnection();
    
    // Set up connection check interval
    const interval = setInterval(checkConnection, 1000);
    
    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Determine display text based on connection status
  const displayText = !isConnected 
    ? 'Connecting...' 
    : playerCount > 0 
      ? `${playerCount} Online` 
      : 'Connected';
  
  return (
    <div className="absolute top-4 right-4 bg-amber-800 text-amber-100 px-3 py-1 rounded-md border-2 border-amber-600 flex items-center shadow-md">
      <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
      <span className="font-pixel text-sm">
        {displayText}
      </span>
    </div>
  );
};

export default OnlineCounter; 