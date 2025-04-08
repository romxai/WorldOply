/**
 * Notification Service
 * Handles displaying notifications to the user for various events
 */

import { AuctionBidPlacedEvent, AuctionCreatedEvent, AuctionEndedEvent } from '../types/realtime';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: number;
  playSound?: boolean;
}

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = [];
  private static instance: NotificationService;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Play a notification sound
   */
  private playSound(sound: 'success' | 'warning' | 'error' | 'info'): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Don't play sounds if browser API is not available
    if (!('AudioContext' in window) && !(window as any).webkitAudioContext) return;
    
    // Sound paths (modify these to point to your actual sound files)
    const soundPaths: Record<string, string> = {
      success: '/sounds/success.mp3',
      warning: '/sounds/warning.mp3',
      error: '/sounds/error.mp3',
      info: '/sounds/info.mp3'
    };
    
    // Try to get cached audio element
    let audio = this.audioCache.get(sound);
    
    // Create new audio element if not cached
    if (!audio) {
      audio = new Audio(soundPaths[sound]);
      this.audioCache.set(sound, audio);
    }
    
    // Play the sound
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.error('Error playing notification sound:', err);
    });
  }

  /**
   * Add a listener for notifications
   */
  public addListener(listener: (notification: Notification) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Show a notification
   */
  public showNotification(message: string, type: NotificationType = NotificationType.INFO, duration: number = 5000, playSound: boolean = false): void {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      duration,
      timestamp: Date.now(),
      playSound
    };

    // Play sound if enabled
    if (playSound) {
      switch (type) {
        case NotificationType.SUCCESS:
          this.playSound('success');
          break;
        case NotificationType.WARNING:
          this.playSound('warning');
          break;
        case NotificationType.ERROR:
          this.playSound('error');
          break;
        case NotificationType.INFO:
          this.playSound('info');
          break;
      }
    }

    this.listeners.forEach(listener => listener(notification));
  }

  /**
   * Show a notification for auction events
   */
  public showAuctionNotification(event: AuctionBidPlacedEvent | AuctionCreatedEvent | AuctionEndedEvent): void {
    if ('bidAmount' in event) {
      // AuctionBidPlacedEvent
      this.showNotification(
        `New bid placed: ${event.bidAmount} coins`,
        NotificationType.INFO,
        5000,
        true // Play sound for new bids
      );
    } else if ('winningBid' in event) {
      // AuctionEndedEvent
      if (event.winningBid) {
        this.showNotification(
          `Auction ended! Winner: ${event.winningBid.playerId} with ${event.winningBid.bidAmount} coins`,
          NotificationType.SUCCESS,
          8000,
          true // Play sound for auction ending
        );
      } else {
        this.showNotification(
          'Auction ended with no winner',
          NotificationType.INFO,
          5000,
          true // Play sound for auction ending
        );
      }
    } else if ('title' in event) {
      // AuctionCreatedEvent
      this.showNotification(
        `New auction created: ${event.title}`,
        NotificationType.INFO,
        5000,
        true // Play sound for new auctions
      );
    }
  }

  /**
   * Show an error notification
   */
  public showError(message: string): void {
    this.showNotification(message, NotificationType.ERROR, 10000, true);
  }

  /**
   * Show a success notification
   */
  public showSuccess(message: string): void {
    this.showNotification(message, NotificationType.SUCCESS, 5000, true);
  }

  /**
   * Show a warning notification
   */
  public showWarning(message: string): void {
    this.showNotification(message, NotificationType.WARNING, 7000, true);
  }
}

export default NotificationService.getInstance(); 