import httpStatus from "http-status";

/**
 * BaseError class represents the base error class
 */
class BaseError extends Error {
  name = "BaseError";

  constructor({
    message = httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_MESSAGE`],
    code = httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_NAME`],
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    metadata = {},
    errors = [],
  }) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.errors = errors;
    this.context = [];

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseError);
    }

    // Ensure the prototype is set correctly
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  /**
   * Add error to errors array
   * @param error - Error object
   */
  addError(error) {
    this.errors.push(error);
    return this;
  }

  /**
   * Add validation details to errors array
   * @param {Array} messages - Array of validation messages
   */
  addDetails(messages = []) {
    for (const message of messages) this.addError({ message });
    return this;
  }

  /**
   * Add context to the error
   * @param context - Context object to add
   * @returns {BaseError}
   */
  addContext(context) {
    if (typeof context !== "object") return this;
    this.context.push(context);
    return this;
  }

  /**
   * Get error messages as array of strings
   * @returns {Array<string>} Array of error messages
   */
  getMessages() {
    if (!this.errors.length) return [this.message];

    return this.errors.map((error) => {
      if (typeof error === "string") {
        return error;
      } else if (error && error.message) {
        return error.message;
      } else {
        return String(error);
      }
    });
  }

  /**
   * Format error object to JSON
   * @returns {Object} Formatted error object
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.errors.length ? { errors: this.errors } : {}),
      metadata: this.metadata,
    };
  }
}

export { BaseError };
