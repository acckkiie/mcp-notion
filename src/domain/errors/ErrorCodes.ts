/**
 * Error Codes
 * Centralized error code constants
 */
export const ErrorCodes = {
  // Operational Errors
  FILE_READ_ERROR: "FILE_READ_ERROR",
  JSON_PARSE_ERROR: "JSON_PARSE_ERROR",
  FILE_SYSTEM_ERROR: "FILE_SYSTEM_ERROR",
  NOTION_API_ERROR: "NOTION_API_ERROR",
  CONFIG_ERROR: "CONFIG_ERROR",

  // Business Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
