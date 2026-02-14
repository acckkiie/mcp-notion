import { DomainError } from "./DomainError.js";
import { ErrorCodes } from "./ErrorCodes.js";

/**
 * Operational Error
 * Errors related to system-level operations
 */
export class OperationalError extends DomainError {}

/**
 * Notion API Error
 * Errors from Notion API calls
 */
export class NotionApiError extends OperationalError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCodes.NOTION_API_ERROR, { ...details, statusCode });
  }
}

/**
 * Configuration Error
 * Errors related to application configuration
 */
export class ConfigError extends OperationalError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCodes.CONFIG_ERROR, details);
  }
}
