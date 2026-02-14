import { describe, it, expect } from "vitest";
import { Success, Failure, success, failure } from "../../../../src/domain/types/Result.js";

describe("Result type", () => {
  describe("Success", () => {
    it("should create a success result", () => {
      const result = success("test value");

      expect(result.kind).toBe("success");
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.value).toBe("test value");
    });

    it("should work with complex types", () => {
      const data = { id: 1, name: "test" };
      const result = success(data);

      expect(result.value).toEqual(data);
    });
  });

  describe("Failure", () => {
    it("should create a failure result", () => {
      const error = new Error("test error");
      const result = failure(error);

      expect(result.kind).toBe("failure");
      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe(error);
    });

    it("should work with custom error types", () => {
      class CustomError extends Error {
        constructor(
          message: string,
          public code: number,
        ) {
          super(message);
        }
      }

      const error = new CustomError("custom error", 404);
      const result = failure(error);

      expect(result.error.code).toBe(404);
    });
  });
});
