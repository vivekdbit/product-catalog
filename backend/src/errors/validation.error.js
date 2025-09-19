import httpStatus from "http-status";

import { BaseError } from "./base.error.js";

/**
 * ValidationError class to handle validation errors
 */
class ValidationError extends BaseError {
  name = "ValidationError";

  constructor(
    message = httpStatus[`${httpStatus.UNPROCESSABLE_ENTITY}_MESSAGE`],
    metadata = {}
  ) {
    super({
      message,
      code: httpStatus[`${httpStatus.UNPROCESSABLE_ENTITY}_NAME`],
      statusCode: httpStatus.UNPROCESSABLE_ENTITY,
      metadata,
    });

    // Ensure the prototype is set correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export { ValidationError };
