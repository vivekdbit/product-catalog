import httpStatus from "http-status";

import { BaseError } from "./base.error.js";

/**
 * BadRequestError class to handle the bad request errors
 */
class BadRequestError extends BaseError {
  name = "BadRequestError";

  constructor(
    message = httpStatus[`${httpStatus.BAD_REQUEST}_MESSAGE`],
    metadata = {}
  ) {
    super({
      message,
      code: httpStatus[`${httpStatus.BAD_REQUEST}_NAME`],
      statusCode: httpStatus.BAD_REQUEST,
      metadata,
    });

    // Ensure the prototype is set correctly
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export { BadRequestError };
