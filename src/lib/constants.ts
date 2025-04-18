
/**
 * Application-wide constants
 */

// Default placeholder image for various components
export const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=No+Image';

/**
 * API related constants
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * UI related constants
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Feature flags and environment settings
 */
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;
