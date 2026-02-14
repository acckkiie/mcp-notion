import { DomainError } from "./DomainError.js";
import { ErrorCodes } from "./ErrorCodes.js";

/**
 * Business Error
 * Errors related to business rule violations
 */
export class BusinessError extends DomainError {}

/**
 * Validation Error
 * Errors related to input validation
 */
export class ValidationError extends BusinessError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCodes.VALIDATION_ERROR, details);
  }
}

/**
 * Authorization Error
 * Errors related to permissions and access control
 */
export class AuthorizationError extends BusinessError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCodes.AUTHORIZATION_ERROR, details);
  }
}
