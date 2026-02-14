import { describe, it, expect } from "vitest";
import { StructuredLogger } from "../../../../src/infrastructure/logging/StructuredLogger.js";

describe("StructuredLogger", () => {
  let logger: StructuredLogger;

  it("should create logger instance", () => {
    logger = new StructuredLogger("test");

    expect(logger).toBeDefined();
  });

  it("should support all log levels", () => {
    logger = new StructuredLogger("test");

    // These should not throw
    expect(() => logger.debug("debug message")).not.toThrow();
    expect(() => logger.info("info message")).not.toThrow();
    expect(() => logger.warn("warn message", { key: "value" })).not.toThrow();
    expect(() => logger.error("error message", new Error("test"))).not.toThrow();
    expect(() => logger.fatal("fatal message", new Error("test"))).not.toThrow();
  });

  it("should handle context data", () => {
    logger = new StructuredLogger("test");

    expect(() => {
      logger.info("test message", { userId: "123", action: "login" });
    }).not.toThrow();
  });
});
