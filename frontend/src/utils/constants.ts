/**
 * Application constants
 * Note: This file avoids import.meta to be Jest-compatible
 * In production, Vite will replace these with actual env vars during build
 */

// Use a function to get env vars that works in both Jest and Vite
function getEnvVar(key: string, defaultValue: string): string {
  // In Jest/test environment
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    return process.env[key] || defaultValue;
  }

  // In Vite, these will be replaced at build time
  // For now, return defaults
  return defaultValue;
}

export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', '/api');
export const APP_NAME = getEnvVar('VITE_APP_NAME', 'Police Case Management System');

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi'];
export const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/m4a'];

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
