/**
 * Polyfills for React Native
 * Fixes common JavaScript environment issues
 */

// Global object polyfill for React Native
if (typeof (global as any) === 'undefined') {
  (global as any) = {};
}

export {};
