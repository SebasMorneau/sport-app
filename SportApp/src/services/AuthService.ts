import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types/api';

class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  static async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  }

  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
    } catch (error) {
      throw error;
    }
  }

  static async login(_credentials: LoginRequest): Promise<AuthResponse> {
    // This would typically make an API call
    // For now, return a mock response
    throw new Error('Login method not implemented - use API instead');
  }

  static async register(_userData: RegisterRequest): Promise<AuthResponse> {
    // This would typically make an API call
    // For now, return a mock response
    throw new Error('Register method not implemented - use API instead');
  }
}

export default AuthService;
