import apiService from './apiService';
import realtimeService from './realtimeService';
import { User } from '../types/user';

/**
 * Player data structure returned from the API
 */
export interface Player {
  _id: string;
  username: string;
  email: string;
  balance: number;
  resources: Record<string, number>;
  ownedTiles?: string[];
  createdAt?: string;
  lastOnline?: string;
}

/**
 * Login response from the API
 */
export interface LoginResponse {
  success: boolean;
  player: Player;
  token: string;
}

/**
 * Registration response from the API
 */
export interface RegisterResponse {
  success: boolean;
  player: Player;
  token: string;
}

/**
 * Refresh token response
 */
interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

/**
 * AuthService handles all authentication-related operations
 * Including API calls, token management, and user state
 */
class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  
  constructor() {
    // Register the refresh token callback with apiService
    apiService.setRefreshTokenCallback(this.refreshAuthToken.bind(this));
    
    // Try to initialize from localStorage on startup
    this.initializeFromStorage();
  }
  
  /**
   * Refresh token handler for apiService
   */
  private async refreshAuthToken(refreshToken: string): Promise<string> {
    try {
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh-token', { refreshToken });
      
      // Store the new tokens
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response.token;
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      this.clearAuth();
      throw error;
    }
  }
  
  private initializeFromStorage() {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      
      if (userJson) {
        try {
          this.currentUser = JSON.parse(userJson);
          this.notifyListeners();
          
          // Initialize realtime connection
          const token = localStorage.getItem('token');
          if (token) {
            realtimeService.initialize(token);
          }
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
          this.clearAuth();
        }
      }
    }
  }
  
  /**
   * Log in a user with username and password
   */
  public async login(username: string, password: string): Promise<User> {
    try {
      const response = await apiService.post<LoginResponse>('/api/players/login', { 
        username, 
        password 
      });
      
      // Map Player to User
      const user: User = this.mapPlayerToUser(response.player);
      
      // Store the auth token
      this.setAuth(user, response.token, response.token); // Using token as refreshToken for now
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Register a new user
   */
  public async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await apiService.post<RegisterResponse>('/api/players/register', {
        username,
        email,
        password
      });
      
      // Map Player to User
      const user: User = this.mapPlayerToUser(response.player);
      
      // Store the auth token
      this.setAuth(user, response.token, response.token); // Using token as refreshToken for now
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Log out the current user
   */
  public async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiService.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth state
      this.clearAuth();
    }
  }
  
  /**
   * Refresh the current user's profile
   */
  public async refreshProfile(): Promise<User> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      const player = await apiService.get<Player>('/api/players/me');
      const user = this.mapPlayerToUser(player);
      this.currentUser = user;
      
      // Update stored user
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      this.notifyListeners();
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Helper method to map Player response from API to User model
   */
  private mapPlayerToUser(player: Player): User {
    return {
      id: player._id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt || new Date().toISOString(),
      updatedAt: player.lastOnline || new Date().toISOString(),
      stats: {
        level: 1, // Default value
        experience: 0, // Default value
        coins: player.balance || 0,
        resources: player.resources
      },
      ownedTiles: player.ownedTiles ? player.ownedTiles.length : 0
    };
  }
  
  private setAuth(user: User, token: string, refreshToken: string) {
    // Store user and tokens
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    // Initialize realtime connection with the token
    realtimeService.initialize(token)
      .then(() => console.log('Realtime service initialized successfully'))
      .catch(error => console.error('Failed to initialize realtime service:', error));
    
    // Notify listeners
    this.notifyListeners();
  }
  
  private clearAuth() {
    // Clear user and tokens
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    
    // Disconnect realtime service
    realtimeService.disconnect();
    
    // Update API service
    apiService.clearToken();
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Check if a user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
  
  /**
   * Get the current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  /**
   * Subscribe to auth state changes
   */
  public onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    
    // Call immediately with current state
    listener(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners() {
    this.authStateListeners.forEach(listener => listener(this.currentUser));
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService; 