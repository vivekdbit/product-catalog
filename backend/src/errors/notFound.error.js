import httpStatus from "http-status";

import { BaseError } from "./base.error.js";

/**
 * NotFoundError class to handle the authentication errors
 */
class NotFoundError extends BaseError {
  name = "NotFoundError";

  constructor(
    message = httpStatus[`${httpStatus.NOT_FOUND}_MESSAGE`],
    metadata = {}
  ) {
    super({
      message,
      code: httpStatus[`${httpStatus.NOT_FOUND}_NAME`],
      statusCode: httpStatus.NOT_FOUND,
      metadata,
    });

    // Ensure the prototype is set correctly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export { NotFoundError };
