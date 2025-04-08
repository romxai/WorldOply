'use client';

import React, { useEffect, useState } from 'react';
import realtimeService from '../../../services/realtimeService';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    // Set up initial status check
    const checkConnection = () => {
      if (mounted) {
        setIsConnected(realtimeService.isConnected());
      }
    };
    
    // Initial check
    checkConnection();
    
    // Set up connection check interval
    const interval = setInterval(checkConnection, 1000);
    
    // Clean up interval on unmount
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="fixed bottom-4 left-4 flex items-center space-x-2 bg-gray-900 bg-opacity-75 px-3 py-1 rounded-md">
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-xs font-pixel text-gray-200">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus; 