import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LOG_LEVELS, COLORS } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Logger Class
 */
export class Logger {
  constructor(serviceName = "APPLICATION") {
    this.serviceName = serviceName;
    this.logLevel = this._getLogLevel();
    this.logDir = path.join(process.cwd(), "logs");
    this.context = {};

    // Ensure logs directory exists
    this._ensureLogDirectory();
  }

  /**
   * Get log level from environment
   */
  _getLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || "INFO";
    return LOG_LEVELS[envLevel] !== undefined
      ? LOG_LEVELS[envLevel]
      : LOG_LEVELS.INFO;
  }

  /**
   * Ensure logs directory exists
   */
  _ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create logs directory:", error.message);
    }
  }

  /**
   * Format timestamp
   */
  _formatTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  _formatMessage(level, message, metadata = {}) {
    const timestamp = this._formatTimestamp();
    const combinedMetadata = { ...this.context, ...metadata };

    const logObject = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...(Object.keys(combinedMetadata).length > 0 && {
        metadata: combinedMetadata,
      }),
    };

    return JSON.stringify(logObject);
  }

  /**
   * Format console message with colors
   */
  _formatConsoleMessage(level, message, metadata = {}) {
    const timestamp = new Date().toLocaleTimeString();
    const color = COLORS[level] || COLORS.RESET;
    const combinedMetadata = { ...this.context, ...metadata };

    let logMessage = `${COLORS.DIM}${timestamp}${COLORS.RESET} ${color}${COLORS.BOLD}[${level}]${COLORS.RESET}`;
    logMessage += ` ${COLORS.BOLD}[${this.serviceName}]${COLORS.RESET}`;

    if (combinedMetadata.method) {
      logMessage += ` ${COLORS.DIM}[${combinedMetadata.method}]${COLORS.RESET}`;
    }

    if (combinedMetadata.requestId) {
      logMessage += ` ${COLORS.DIM}[${combinedMetadata.requestId}]${COLORS.RESET}`;
    }

    logMessage += `: ${message}`;

    // Add metadata if present (excluding already displayed fields)
    const displayMetadata = { ...combinedMetadata };
    delete displayMetadata.method;
    delete displayMetadata.requestId;

    if (Object.keys(displayMetadata).length > 0) {
      logMessage += ` ${COLORS.DIM}| ${JSON.stringify(displayMetadata)}${
        COLORS.RESET
      }`;
    }

    return logMessage;
  }

  /**
   * Write to log file
   */
  _writeToFile(level, formattedMessage) {
    try {
      const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
      const combinedLogFile = path.join(this.logDir, "combined.log");

      const logEntry = formattedMessage + "\n";

      // Write to level-specific file
      fs.appendFileSync(logFile, logEntry);

      // Write to combined log file
      fs.appendFileSync(combinedLogFile, logEntry);

      // Rotate logs if they get too large (simple rotation)
      this._rotateLogs(logFile);
      this._rotateLogs(combinedLogFile);
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  /**
   * Simple log rotation
   */
  _rotateLogs(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (stats.size > maxSize) {
        const backupPath = `${filePath}.${Date.now()}`;
        fs.renameSync(filePath, backupPath);

        // Keep only last 5 backup files
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath);
        const files = fs
          .readdirSync(dir)
          .filter((file) => file.startsWith(basename) && file !== basename)
          .sort()
          .reverse();

        if (files.length > 5) {
          files.slice(5).forEach((file) => {
            fs.unlinkSync(path.join(dir, file));
          });
        }
      }
    } catch (error) {
      // Ignore rotation errors
    }
  }

  /**
   * Generic log method
   */
  _log(level, message, metadata = {}) {
    const levelValue = LOG_LEVELS[level];

    // Skip if log level is too low
    if (levelValue > this.logLevel) {
      return;
    }

    const formattedMessage = this._formatMessage(level, message, metadata);
    const consoleMessage = this._formatConsoleMessage(level, message, metadata);

    // Write to file
    this._writeToFile(level, formattedMessage);

    // Write to console in development
    if (process.env.NODE_ENV !== "production") {
      console.log(consoleMessage);
    }
  }

  /**
   * Log info message
   */
  info(message, metadata = {}) {
    this._log("INFO", message, metadata);
  }

  /**
   * Log error message
   */
  error(message, error = null, metadata = {}) {
    const errorMetadata = { ...metadata };

    if (error) {
      errorMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error.code && { code: error.code }),
        ...(error.statusCode && { statusCode: error.statusCode }),
      };
    }

    this._log("ERROR", message, errorMetadata);
  }

  /**
   * Log warning message
   */
  warn(message, metadata = {}) {
    this._log("WARN", message, metadata);
  }

  /**
   * Log debug message
   */
  debug(message, metadata = {}) {
    this._log("DEBUG", message, metadata);
  }
}

/**
 * Create logger instances for different services
 */
export const createLogger = (serviceName) => new Logger(serviceName);

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Service-specific loggers
 */
export const productLogger = new Logger("PRODUCT_SERVICE");
export const databaseLogger = new Logger("DATABASE");
export const validationLogger = new Logger("VALIDATION");
export const authLogger = new Logger("AUTH");
export const apiLogger = new Logger("API");
export const productControllerLogger = new Logger("PRODUCT_CONTROLLER");
