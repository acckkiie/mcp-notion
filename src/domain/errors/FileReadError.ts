import { OperationalError } from "./OperationalError.js";
import { ErrorCodes } from "./ErrorCodes.js";

/**
 * File Read Error
 * Thrown when file reading fails
 */
export class FileReadError extends OperationalError {
  constructor(
    public readonly filePath: string,
    public readonly originalError?: Error,
    details?: Record<string, unknown>,
  ) {
    super(`Failed to read file: ${filePath}`, ErrorCodes.FILE_READ_ERROR, {
      ...details,
      filePath,
      originalError,
    });
  }
}
