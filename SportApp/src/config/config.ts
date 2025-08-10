import { Platform } from 'react-native';

interface Config {
  API_URL: string;
  API_TIMEOUT: number;
  CACHE_DURATION: number;
  MAX_RETRY_ATTEMPTS: number;
  DEVELOPMENT: boolean;
}

const getApiUrl = (): string => {
  // Check for environment-specific URL first
  const envApiUrl = process.env.REACT_APP_API_URL || process.env.API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  if (__DEV__) {
    // Development URLs
    if (Platform.OS === 'ios') {
      return 'http://localhost:3500/api';
    } else {
      // Android emulator
      return 'http://10.0.2.2:3500/api';
    }
  }

  // Production URL - must be set via environment variable
  throw new Error('API_URL must be configured for production builds');
};

const config: Config = {
  API_URL: getApiUrl(),
  API_TIMEOUT: 30000, // 30 seconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  DEVELOPMENT: __DEV__,
};

export default config;
