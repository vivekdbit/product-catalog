// Custom error classes for handling different types of errors in the application
import { BadRequestError } from "./badRequest.error.js";
import { DatabaseError } from "./database.error.js";
import { InternalServerError } from "./internalServer.error.js";
import { NotFoundError } from "./notFound.error.js";
import { ValidationError } from "./validation.error.js";
import { BaseError } from "./base.error.js";

export {
  BadRequestError,
  DatabaseError,
  InternalServerError,
  NotFoundError,
  ValidationError,
  BaseError,
};
