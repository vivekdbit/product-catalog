import httpStatus from "http-status";

import { BaseError } from "./base.error.js";

/**
 * InternalServerError class to handle the authentication errors
 */
class InternalServerError extends BaseError {
  name = "InternalServerError";

  constructor(
    message = httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_MESSAGE`],
    metadata = {}
  ) {
    super({
      message,
      code: httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_NAME`],
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      metadata,
    });

    // Ensure the prototype is set correctly
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export { InternalServerError };
