import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Error response type
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Base API Service
 * Core HTTP client for the application
 * Handles requests, interceptors, and error handling
 */
class ApiService {
  private client: AxiosInstance;
  private refreshTokenCallback: ((refreshToken: string) => Promise<string>) | null = null;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.worldoply.com';
    
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // If the error is not 401 or we don't have a config, or no refresh callback, just reject
        if (!error.response || 
            error.response.status !== 401 || 
            !originalRequest || 
            !this.refreshTokenCallback) {
          return Promise.reject(this.handleError(error));
        }
        
        // Check if we're already refreshing to avoid multiple refreshes
        if (!this.refreshTokenPromise) {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // No refresh token, can't refresh
            return Promise.reject(this.handleError(error));
          }
          
          // Create the refresh promise
          this.refreshTokenPromise = this.refreshTokenCallback(refreshToken);
        }
        
        try {
          // Wait for the token to refresh
          const newToken = await this.refreshTokenPromise;
          
          // Reset for next time
          this.refreshTokenPromise = null;
          
          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the original request
          return this.client(originalRequest);
        } catch (refreshError) {
          // Reset for next time
          this.refreshTokenPromise = null;
          
          // Could not refresh, reject
          return Promise.reject(this.handleError(error));
        }
      }
    );
  }

  /**
   * Set the callback for refreshing tokens
   * @param callback Function that takes a refresh token and returns a promise of a new token
   */
  public setRefreshTokenCallback(callback: (refreshToken: string) => Promise<string>): void {
    this.refreshTokenCallback = callback;
  }

  /**
   * Clear the auth token and reset refresh callback
   */
  public clearToken(): void {
    this.refreshTokenCallback = null;
    this.refreshTokenPromise = null;
  }

  private handleError(error: AxiosError): ApiError {
    let errorResponse: ApiError = {
      message: 'An unexpected error occurred'
    };
    
    if (error.response && error.response.data) {
      // Use the server's error message if available
      errorResponse = error.response.data as ApiError;
    } else if (error.message) {
      errorResponse.message = error.message;
    }
    
    return errorResponse;
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request(config);
      
      // Handle response format - the API returns success, player/data, token at top level
      // not nested under a data property
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // HTTP methods
  public async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params
    });
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data
    });
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data
    });
  }

  public async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data
    });
  }

  public async delete<T>(url: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url
    });
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService; 