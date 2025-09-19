import httpStatus from "http-status";

import { BaseError } from "./base.error.js";

/**
 * DatabaseError class to handle the authentication errors
 */
class DatabaseError extends BaseError {
  name = "DatabaseError";

  constructor(message = "Database operation failed", metadata = {}) {
    super({
      message,
      code: "DATABASE_ERROR",
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      metadata,
    });

    // Ensure the prototype is set correctly
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  /**
   * Checks if the error is a foreign key violation error
   * @param error - The error object to check
   * @return {boolean} - Returns true if the error is a foreign key violation error, false otherwise
   */
  static isForeignKeyViolation(error) {
    return (
      error.code === "23503" || // PostgreSQL foreign key violation code
      (error.message &&
        error.message.includes("violates foreign key constraint"))
    );
  }

  /**
   * Checks if the error is a unique violation error
   * @param error - The error object to check
   * @return {boolean} - Returns true if the error is a unique violation error, false otherwise
   */
  static isUniqueViolation(error) {
    return (
      error.code === "23505" || // PostgreSQL unique violation code
      (error.message && error.message.includes("duplicate key value"))
    );
  }

  /**
   * Checks if the error is a not null violation error
   * @param error - The error object to check
   * @return {boolean} - Returns true if the error is a not null violation error, false otherwise
   */
  static isNotNullViolation(error) {
    return (
      error.code === "23502" || // PostgreSQL not null violation code
      (error.message && error.message.includes("null value in column"))
    );
  }
}

export { DatabaseError };
