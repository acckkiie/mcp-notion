import { OperationalError } from "./OperationalError.js";
import { ErrorCodes } from "./ErrorCodes.js";

/**
 * JSON Parse Error
 * Thrown when JSON parsing fails
 */
export class JsonParseError extends OperationalError {
  constructor(
    public readonly source: string,
    public readonly originalError?: Error,
    details?: Record<string, unknown>,
  ) {
    super(`Failed to parse JSON from file: ${source}`, ErrorCodes.JSON_PARSE_ERROR, {
      ...details,
      source,
      originalError,
    });
  }
}
