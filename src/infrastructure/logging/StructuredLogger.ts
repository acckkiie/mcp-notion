import log4js from "log4js";

/**
 * Structured Logger
 * Provides JSON-formatted logging with context support
 */
export class StructuredLogger {
  private logger: log4js.Logger;

  constructor(category = "default") {
    this.logger = log4js.getLogger(category);
  }

  /**
   * Configure logging system
   * Should be called once at application startup
   */
  static configureLogging(config: any): void {
    log4js.configure(config);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(JSON.stringify({ message, ...context }));
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(JSON.stringify({ message, ...context }));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(JSON.stringify({ message, ...context }));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.error(
      JSON.stringify({
        message,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
        ...context,
      }),
    );
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.fatal(
      JSON.stringify({
        message,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
        ...context,
      }),
    );
  }

  /**
   * Shutdown logging system
   */
  static shutdown(): Promise<void> {
    return new Promise((resolve) => {
      log4js.shutdown(() => resolve());
    });
  }
}
