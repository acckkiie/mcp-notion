import { describe, it, expect } from "vitest";
import {
  DomainError,
  BusinessError,
  ValidationError,
  AuthorizationError,
  OperationalError,
  NotionApiError,
  ConfigError,
} from "../../../../src/domain/errors/index.js";

describe("Domain Errors", () => {
  describe("DomainError", () => {
    it("should create a domain error with code and details", () => {
      const error = new DomainError("test error", "TEST_ERROR", { key: "value" });

      expect(error.message).toBe("test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.details).toEqual({ key: "value" });
      expect(error.name).toBe("DomainError");
    });
  });

  describe("ValidationError", () => {
    it("should create a validation error", () => {
      const error = new ValidationError("invalid input", { field: "email" });

      expect(error.message).toBe("invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details).toEqual({ field: "email" });
      expect(error instanceof BusinessError).toBe(true);
      expect(error instanceof DomainError).toBe(true);
    });
  });

  describe("AuthorizationError", () => {
    it("should create an authorization error", () => {
      const error = new AuthorizationError("access denied");

      expect(error.message).toBe("access denied");
      expect(error.code).toBe("AUTHORIZATION_ERROR");
      expect(error instanceof BusinessError).toBe(true);
    });
  });

  describe("NotionApiError", () => {
    it("should create a notion api error with status code", () => {
      const error = new NotionApiError("api call failed", 400, { endpoint: "/pages" });

      expect(error.message).toBe("api call failed");
      expect(error.code).toBe("NOTION_API_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.details?.statusCode).toBe(400);
      expect(error.details?.endpoint).toBe("/pages");
      expect(error instanceof OperationalError).toBe(true);
    });
  });

  describe("ConfigError", () => {
    it("should create a config error", () => {
      const error = new ConfigError("missing config key", { key: "apiKey" });

      expect(error.message).toBe("missing config key");
      expect(error.code).toBe("CONFIG_ERROR");
      expect(error.details).toEqual({ key: "apiKey" });
      expect(error instanceof OperationalError).toBe(true);
    });
  });
});
