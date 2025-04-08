import { NextRequest, NextResponse } from 'next/server';
import { EventType, EventTopic } from '@/types/realtime';
import socketio from 'socket.io-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auctionId, amount } = body;
    
    // Create a bid payload
    const bidPayload = {
      auctionId: auctionId || 'test-auction-id',
      playerId: 'test-player-id',
      bidAmount: amount || 100,
      timestamp: new Date().toISOString(),
      previousPrice: (amount || 100) - 10
    };
    
    console.log('Sending test bid via WebSocket client:', bidPayload);
    
    // Connect directly to the WebSocket server
    try {
      // Create a promise to handle async Socket.IO operations
      const socketPromise = new Promise((resolve, reject) => {
        const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        if (!socketUrl) {
          reject(new Error('WebSocket URL not configured'));
          return;
        }
        
        // Connect with a service token for admin privileges
        const socket = socketio(socketUrl, {
          auth: { 
            serviceToken: process.env.WEBSOCKET_API_KEY || 'development-service-key'
          },
          transports: ['websocket']
        });
        
        // Set a timeout
        const timeout = setTimeout(() => {
          socket.disconnect();
          reject(new Error('Connection timeout'));
        }, 5000);
        
        socket.on('connect', () => {
          console.log('Connected to WebSocket server with ID:', socket.id);
          
          // Emit the publish event with the proper payload
          socket.emit('publish', {
            topic: `${EventTopic.AUCTION}:${auctionId || 'test-auction-id'}`,
            event: {
              type: EventType.AUCTION_BID_PLACED,
              data: bidPayload
            }
          });
          
          // Wait a bit to make sure the event is processed
          setTimeout(() => {
            socket.disconnect();
            clearTimeout(timeout);
            resolve({ success: true, socketId: socket.id });
          }, 500);
        });
        
        socket.on('connect_error', (error: Error) => {
          console.error('Socket connection error:', error);
          clearTimeout(timeout);
          socket.disconnect();
          reject(new Error(`Connection error: ${error.message}`));
        });
      });
      
      // Wait for the socket operations to complete
      const result = await socketPromise;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Test bid sent via WebSocket',
        details: result
      });
    } catch (error: any) {
      console.error('Failed to send test bid via WebSocket:', error);
      
      // Try direct event trigger through document event
      // Note: This won't work in a server component, this is just for API route compatibility
      if (typeof document !== 'undefined') {
        const customEvent = new CustomEvent('auction:bid-placed', {
          detail: {
            type: EventType.AUCTION_BID_PLACED,
            data: bidPayload
          },
          bubbles: true
        });
        
        document.dispatchEvent(customEvent);
      }
      
      return NextResponse.json({
        success: false,
        message: 'Failed to send test bid via WebSocket',
        error: error.message
      });
    }
  } catch (error: any) {
    console.error('Error processing test bid request:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process test bid request',
      error: error.message
    }, { status: 500 });
  }
} 