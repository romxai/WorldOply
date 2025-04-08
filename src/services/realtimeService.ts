/**
 * Realtime service for connecting to the DC World Building WebSocket server
 * Handles event subscriptions and real-time updates
 */
import { default as socketio } from 'socket.io-client';
import { 
  EventType,
  EventTopic,
  getAuctionTopic,
  getGlobalAuctionTopic,
  AuctionBidPlacedEvent,
  AuctionCreatedEvent,
  AuctionEndedEvent
} from '../types/realtime';

/**
 * Interface for event handlers
 */
interface EventHandler {
  (data: any): void;
}

/**
 * Interface for subscriptions
 */
interface Subscription {
  topic: string;
  eventType: EventType;
  handler: EventHandler;
}

class RealtimeService {
  private socket: any = null;
  private subscriptions: Subscription[] = [];
  private _isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
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
        transports: ['websocket'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });
      
      console.log('Socket.IO instance created, registering event handlers');

      // Set up event handlers
      this.setupEventHandlers();
      
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
   * Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    console.log('Setting up Socket.IO event handlers');
    
    // Set up event handlers for Socket.IO connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleError.bind(this));
    this.socket.on('subscribed', this.handleSubscribed.bind(this));
    this.socket.on('unsubscribed', this.handleUnsubscribed.bind(this));
    
    // Debug all incoming events
    this.socket.onAny((eventName: string, ...args: any[]) => {
      console.log(`Received event: ${eventName}`, args);
    });
    
    // Set up handlers for all event types (using the string values to match server format)
    Object.values(EventType).forEach(eventType => {
      console.log(`Setting up handler for event type: ${eventType}`);
      this.socket?.on(eventType, (data: any) => {
        console.log(`Received event of type ${eventType}:`, data);
        
        // Find subscriptions matching this event type
        this.subscriptions.forEach(sub => {
          if (sub.eventType === eventType) {
            console.log(`Found matching subscription for ${eventType} on topic ${sub.topic}`);
            try {
              sub.handler(data.data || data);
            } catch (error) {
              console.error(`Error in event handler for ${eventType}:`, error);
            }
          }
        });
      });
    });
  }

  /**
   * Handle Socket.IO connect event
   */
  private handleConnect(): void {
    console.log('Socket.IO connected successfully');
    this._isConnected = true;
    this.reconnectAttempts = 0;
    
    // After connecting, dump subscription info
    console.log(`Current subscriptions (${this.subscriptions.length}):`, 
      this.subscriptions.map(s => `${s.topic}:${s.eventType}`));
    
    // Resubscribe to all topics
    this.resubscribeAll();
  }

  /**
   * Handle Socket.IO disconnect event with exponential backoff
   */
  private handleDisconnect(reason: string): void {
    this._isConnected = false;
    console.log(`Socket.IO disconnected: ${reason}`);
    
    // Only attempt reconnect if not an intentional disconnect
    if (reason !== 'io client disconnect') {
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Check if we've hit the maximum reconnect attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    
    // Increment reconnect attempts
    this.reconnectAttempts++;
    
    // Use exponential backoff for reconnect delay
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 
      30000 // Max 30 seconds
    );
    
    console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    // Set a timer to reconnect
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      
      // Get the token again (it might have changed)
      const token = localStorage.getItem('token') || undefined;
      
      // Initialize with token
      this.initialize(token)
        .then(() => {
          console.log('Reconnected successfully');
          this.reconnectAttempts = 0;
          this.reconnectTimer = null;
        })
        .catch(error => {
          console.error('Failed to reconnect:', error);
          // Will try again on next cycle
        });
    }, delay);
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
    
    console.log(`Subscribing to ${eventType} events on topic ${formattedTopic}`);
    
    // Store subscription for reconnect
    this.subscriptions.push({
      topic: formattedTopic,
      eventType,
      handler,
    });
    
    // If connected, send subscription message
    if (this._isConnected && this.socket) {
      console.log(`Sending subscription request for topic ${formattedTopic}`);
      this.socket.emit('subscribe', { topic: formattedTopic });
    } else {
      console.log(`Not connected, subscription for ${formattedTopic} will be sent on reconnect`);
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

  /**
   * Subscribe to a specific auction's updates via WebSocket
   */
  public subscribeToAuction(auctionId: string, callback: (data: any) => void): void {
    // Get the formatted topic for this auction
    const topic = getAuctionTopic(auctionId);
    
    // Create a shared handler that filters events for this auction
    const handleEvent = (data: any) => {
      // Only process events for this specific auction
      if (data.auctionId === auctionId) {
        callback(data);
      }
    };
    
    // Subscribe to all relevant auction events
    this.subscribe(EventTopic.AUCTION, auctionId, EventType.AUCTION_BID_PLACED, handleEvent);
    this.subscribe(EventTopic.AUCTION, auctionId, EventType.AUCTION_STARTED, handleEvent);
    this.subscribe(EventTopic.AUCTION, auctionId, EventType.AUCTION_ENDED, handleEvent);
  }
}

// Create a singleton instance
const realtimeService = new RealtimeService();

export default realtimeService; 