/**
 * Realtime service for connecting to the DC World Building WebSocket server
 * Handles event subscriptions and real-time updates
 */
import { default as socketio } from 'socket.io-client';

// Topics for event subscriptions
export enum EventTopic {
  GLOBAL = 'global',
  AUCTION = 'AUCTION',
  LAND_SQUARE = 'LAND_SQUARE',
  PLAYER = 'PLAYER',
  MARKETPLACE = 'MARKETPLACE'
}

// Event types for realtime communication
export enum EventType {
  AUCTION_STARTED = 'AUCTION_STARTED',
  AUCTION_ENDED = 'AUCTION_ENDED',
  AUCTION_BID_PLACED = 'AUCTION_BID_PLACED',
  RESOURCES_UPDATED = 'RESOURCES_UPDATED',
  PLAYER_NOTIFICATION = 'PLAYER_NOTIFICATION',
  LAND_UPDATED = 'LAND_UPDATED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_MESSAGE',
  TEST_EVENT = 'TEST_EVENT'
}

export type EventHandler = (data: any) => void;

interface Subscription {
  topic: string;
  eventType: EventType;
  handler: EventHandler;
}

class RealtimeService {
  private socket: any = null;
  private subscriptions: Subscription[] = [];
  private _isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private playerCountUpdateCallback: ((count: number) => void) | null = null;
  private token: string | undefined;

  /**
   * Initialize the realtime service
   */
  public async initialize(token?: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS || process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === 'false') {
      console.log('WebSockets are disabled');
      return;
    }

    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      console.error('WebSocket URL not configured');
      return;
    }

    this.token = token;
    console.log(`Initializing socket connection to ${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);
    console.log(`Token available: ${!!token}`);

    try {
      // Close existing connection if any
      if (this.socket) {
        console.log('Closing existing socket connection');
        this.socket.disconnect();
        this.socket = null;
      }
      
      // Create Socket.IO connection with auth token
      this.socket = socketio(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
        auth: token ? { token } : {},
        transports: ['websocket']
      });
      
      console.log('Socket.IO instance created, registering event handlers');

      // Set up event handlers
      this.socket.on('connect', this.handleConnect.bind(this));
      this.socket.on('disconnect', this.handleDisconnect.bind(this));
      this.socket.on('connect_error', this.handleError.bind(this));
      this.socket.on('subscribed', this.handleSubscribed.bind(this));
      this.socket.on('unsubscribed', this.handleUnsubscribed.bind(this));
      
      // Set up handlers for all event types
      Object.values(EventType).forEach(eventType => {
        this.socket?.on(eventType, (data: any) => {
          // Find subscriptions matching this event type
          this.subscriptions.forEach(sub => {
            if (sub.eventType === eventType) {
              sub.handler(data);
            }
          });
        });
      });
      
      // Return promise that resolves when connected
      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket initialization failed'));
          return;
        }
        
        const timeout = setTimeout(() => {
          console.error('Socket connection timed out after 30 seconds');
          reject(new Error('Connection timeout'));
        }, 30000);
        
        this.socket.once('connect', () => {
          console.log('Socket connected successfully');
          clearTimeout(timeout);
          resolve();
        });
        
        this.socket.once('connect_error', (error: Error) => {
          console.error('Socket connection error in initialization:', error);
          // Don't reject here, let the timeout handle it or wait for possible recovery
        });
      });
    } catch (error) {
      console.error('Failed to connect to Socket.IO server:', error);
      this._isConnected = false;
      throw error;
    }
  }

  /**
   * Handle Socket.IO connect event
   */
  private handleConnect(): void {
    this._isConnected = true;
    this.reconnectAttempts = 0;
    console.log('Socket.IO connected');
    
    // Resubscribe to all topics
    this.resubscribeAll();
  }

  /**
   * Handle Socket.IO disconnect event
   */
  private handleDisconnect(reason: string): void {
    this._isConnected = false;
    console.log(`Socket.IO disconnected: ${reason}`);
    
    // No need to handle reconnection as Socket.IO handles it automatically
  }

  /**
   * Handle Socket.IO error event
   */
  private handleError(error: Error): void {
    console.error('Socket.IO error:', error);
    
    // Log more detailed information for debugging
    if (error.message) {
      console.error('Error message:', error.message);
      
      // Provide more user-friendly error messages for common issues
      if (error.message.includes('xhr poll error')) {
        console.error('This may be a CORS issue or the server is not reachable. Check server logs and CORS configuration.');
      }
      
      if (error.message.includes('timeout')) {
        console.error('Connection timed out. The server might be down or not responding.');
      }
      
      if (error.message.includes('Invalid namespace')) {
        console.error('Invalid Socket.IO namespace. Check your NEXT_PUBLIC_WEBSOCKET_URL configuration.');
      }
    }
    
    // Log additional context if available
    if ((error as any).context) {
      console.error('Error context:', (error as any).context);
    }
    
    // Log description if available
    if ((error as any).description) {
      console.error('Error description:', (error as any).description);
    }
    
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Handle subscription confirmation
   */
  private handleSubscribed(data: { topic: string }): void {
    console.log(`Successfully subscribed to ${data.topic}`);
  }

  /**
   * Handle unsubscription confirmation
   */
  private handleUnsubscribed(data: { topic: string }): void {
    console.log(`Successfully unsubscribed from ${data.topic}`);
  }

  /**
   * Disconnect from the realtime service
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      console.log('Socket.IO disconnected');
    }
  }

  /**
   * Subscribe to a specific event on a topic
   */
  public subscribe(topic: EventTopic, id: string | undefined, eventType: EventType, handler: EventHandler): void {
    const formattedTopic = id ? `${topic}:${id}` : topic;
    
    // Store subscription for reconnect
    this.subscriptions.push({
      topic: formattedTopic,
      eventType,
      handler,
    });
    
    // If connected, send subscription message
    if (this._isConnected && this.socket) {
      this.socket.emit('subscribe', { topic: formattedTopic });
    }
  }

  /**
   * Unsubscribe from a specific event on a topic
   */
  public unsubscribe(topic: EventTopic, id?: string, eventType?: EventType): void {
    const formattedTopic = id ? `${topic}:${id}` : topic;
    
    // Remove from local subscriptions
    this.subscriptions = this.subscriptions.filter(sub => {
      if (eventType) {
        return !(sub.topic === formattedTopic && sub.eventType === eventType);
      } else {
        return sub.topic !== formattedTopic;
      }
    });
    
    // If connected, send unsubscribe message
    if (this._isConnected && this.socket) {
      this.socket.emit('unsubscribe', { topic: formattedTopic });
    }
  }

  /**
   * Resubscribe to all stored subscriptions
   */
  private resubscribeAll(): void {
    if (!this._isConnected || !this.socket) {
      return;
    }

    // Get unique topics
    const topics = new Set(this.subscriptions.map(sub => sub.topic));
    
    // Subscribe to each topic
    topics.forEach(topic => {
      this.socket?.emit('subscribe', { topic });
    });
  }

  /**
   * Subscribe to player count updates
   */
  public onPlayerCountUpdate(callback: (count: number) => void): void {
    this.playerCountUpdateCallback = callback;
    
    // Subscribe to the global topic for system announcements
    this.subscribe(EventTopic.GLOBAL, undefined, EventType.SYSTEM_ANNOUNCEMENT, (data) => {
      if (data.type === 'player_count' && this.playerCountUpdateCallback) {
        this.playerCountUpdateCallback(data.count);
      }
    });
  }

  /**
   * Check if the socket is currently connected
   */
  public isConnected(): boolean {
    return this._isConnected;
  }
}

// Create a singleton instance
const realtimeService = new RealtimeService();

export default realtimeService; 