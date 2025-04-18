/**
 * Utility to handle dynamic URLs in the application
 * Updates environment variables based on current browser URL
 */

export const updateDynamicUrls = () => {
  if (typeof window !== 'undefined') {
    // Set the current URL to be used in the app
    window.__NEXT_PUBLIC_URL = window.location.origin;
    
    // Make these URLs available to all components
    window.__NEXT_PUBLIC_IMAGE_URL = `${window.location.origin}/logo.png`;
    window.__NEXT_PUBLIC_SPLASH_IMAGE_URL = `${window.location.origin}/logo.png`;
    
    // Log the base URL for debugging
    console.log('Dynamic base URL set to:', window.location.origin);
    
    return window.location.origin;
  }
  
  // Default to the environment variable on server-side
  return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
};

/**
 * Gets the current base URL (client or server)
 */
export const getCurrentBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.__NEXT_PUBLIC_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
};

declare global {
  interface Window {
    __NEXT_PUBLIC_URL: string;
    __NEXT_PUBLIC_IMAGE_URL: string;
    __NEXT_PUBLIC_SPLASH_IMAGE_URL: string;
  }
} 