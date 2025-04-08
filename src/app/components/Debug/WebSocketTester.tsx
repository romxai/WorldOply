'use client';

import React, { useState, useEffect } from 'react';
import { default as socketio, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

interface SocketData {
  topic: string;
  message: string;
}

const WebSocketTester: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const { user } = useAuth();
  const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null);
  
  // Setup the socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      addMessage('No token found, please log in');
      return;
    }
    
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!socketUrl) {
      addMessage('No WebSocket URL configured');
      return;
    }
    
    addMessage(`Connecting to ${socketUrl}...`);
    
    const socketInstance = socketio(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      reconnection: true
    });
    
    socketInstance.on('connect', () => {
      setConnected(true);
      setSocketId(socketInstance.id);
      addMessage(`Connected with ID: ${socketInstance.id}`);
      
      // Subscribe to auction topic
      socketInstance.emit('subscribe', { topic: 'auction' });
    });
    
    socketInstance.on('disconnect', (reason: string) => {
      setConnected(false);
      addMessage(`Disconnected: ${reason}`);
    });
    
    socketInstance.on('connect_error', (error: Error) => {
      addMessage(`Connection error: ${error.message}`);
    });
    
    socketInstance.on('subscribed', (data: SocketData) => {
      addMessage(`Subscribed to: ${data.topic}`);
    });
    
    // Listen for all events and log them
    // Using any type since we don't know what format the server might send
    // @ts-ignore - onAny is a Socket.IO method but TypeScript doesn't recognize it
    socketInstance.onAny((event: string, ...args: any[]) => {
      addMessage(`Event: ${event}, Data: ${JSON.stringify(args)}`);
    });
    
    setSocket(socketInstance);
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);
  
  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toISOString().substring(11, 19)} - ${message}`]);
  };
  
  const handleTestBid = () => {
    addMessage('Testing manual bid event...');
    
    fetch('/api/debug/test-bid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        auctionId: 'test-auction-id',
        amount: 100
      })
    })
    .then(response => response.json())
    .then(data => {
      addMessage(`Test bid response: ${JSON.stringify(data)}`);
    })
    .catch(error => {
      addMessage(`Test bid error: ${error.message}`);
    });
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-bold mb-2">WebSocket Diagnostics</h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Status: {connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        {socketId && <div className="text-xs text-gray-500">Socket ID: {socketId}</div>}
        {user && <div className="text-xs text-gray-500">User: {user.username}</div>}
      </div>
      
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
          onClick={handleTestBid}
        >
          Test Bid Event
        </button>
        
        <button 
          className="bg-gray-200 px-3 py-1 rounded"
          onClick={() => {
            setMessages([]);
          }}
        >
          Clear Log
        </button>
      </div>
      
      <div className="h-64 overflow-y-auto border p-2 bg-gray-50 rounded text-xs font-mono">
        {messages.map((message, index) => (
          <div key={index} className="mb-1">{message}</div>
        ))}
        {messages.length === 0 && <div className="text-gray-400">No messages yet</div>}
      </div>
    </div>
  );
};

export default WebSocketTester; 