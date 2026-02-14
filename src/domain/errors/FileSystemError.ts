import { OperationalError } from "./OperationalError.js";
import { ErrorCodes } from "./ErrorCodes.js";

/**
 * File System Error
 * Thrown when file system operations fail
 */
export class FileSystemError extends OperationalError {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error,
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCodes.FILE_SYSTEM_ERROR, {
      ...details,
      operation,
      originalError,
    });
  }
}
