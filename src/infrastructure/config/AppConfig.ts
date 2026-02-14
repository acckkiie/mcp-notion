import config from "config";
import { ConfigError } from "../../domain/errors/index.js";

/**
 * Application Configuration Singleton
 * Manages all application configuration with environment variable support
 */
export class AppConfig {
  private static instance: AppConfig | null = null;
  private configCache: Map<string, any> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  /**
   * Get a configuration value
   * Supports "env:" prefix for environment variables
   */
  get<T = any>(key: string): T {
    // Check cache first
    if (this.configCache.has(key)) {
      return this.configCache.get(key) as T;
    }

    try {
      let value = config.get<string | T>(key);

      // Handle env: prefix
      if (typeof value === "string" && value.startsWith("env:")) {
        const envKey = value.substring(4);
        const envValue = process.env[envKey];
        if (!envValue) {
          throw new ConfigError(`Environment variable ${envKey} is not set`);
        }
        value = envValue as T;
      }

      // Cache the value
      this.configCache.set(key, value);
      return value as T;
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      throw new ConfigError(`Configuration key "${key}" not found`, {
        key,
        originalError: error,
      });
    }
  }

  /**
   * Check if a configuration key exists
   */
  has(key: string): boolean {
    return config.has(key);
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.configCache.clear();
  }
}

/**
 * Export singleton instance
 */
export const appConfig = AppConfig.getInstance();
