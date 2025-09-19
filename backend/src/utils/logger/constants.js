/**
 * Log levels with priority (lower number = higher priority)
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * ANSI color codes for console output
 */
export const COLORS = {
  ERROR: "\x1b[31m", // Red
  WARN: "\x1b[33m", // Yellow
  INFO: "\x1b[32m", // Green
  DEBUG: "\x1b[36m", // Cyan
  RESET: "\x1b[0m", // Reset
  BOLD: "\x1b[1m", // Bold
  DIM: "\x1b[2m", // Dim
};
