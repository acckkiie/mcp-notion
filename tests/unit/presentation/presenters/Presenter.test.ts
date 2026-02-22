import { describe, it, expect, vi, beforeEach } from "vitest";
import { Presenter } from "../../../../src/presentation/presenters/Presenter.js";
import { success, failure } from "../../../../src/domain/types/Result.js";

describe("Presenter", () => {
  describe("successResponse", () => {
    it("should generate success response", () => {
      const data = { id: "123", title: "Test Page" };
      const response = Presenter.successResponse(data);

      expect(response).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      });
    });

    it("should extract specified top-level fields", () => {
      const data = { id: "123", name: "test", other: "ignore" };
      const extract = ["id", "name"];
      const response = Presenter.successResponse(data, extract);

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent).toEqual({ id: "123", name: "test" });
      expect(parsedContent.other).toBeUndefined();
    });

    it("should extract nested fields using dot notation", () => {
      const data = {
        id: "123",
        properties: {
          title: { type: "text", content: "Hello" },
          status: "done",
        },
      };
      const extract = ["id", "properties.title.content"];
      const response = Presenter.successResponse(data, extract);

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent).toEqual({
        id: "123",
        properties: {
          title: {
            content: "Hello",
          },
        },
      });
      expect(parsedContent.properties.status).toBeUndefined();
    });

    it("should handle array response", () => {
      const data = [
        { id: "1", name: "one", other: "ignore" },
        { id: "2", name: "two", other: "ignore" },
      ];
      const extract = ["id"];
      const response = Presenter.successResponse(data, extract);

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent).toEqual([{ id: "1" }, { id: "2" }]);
    });

    it("should return all fields when extract is ['none']", () => {
      const data = { id: "123", name: "test", other: "keep" };
      const extract = ["none"];
      const response = Presenter.successResponse(data, extract);

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent).toEqual({ id: "123", name: "test", other: "keep" });
    });
  });

  describe("errorResponse", () => {
    it("should generate error response", () => {
      const error = new Error("Something went wrong");
      const response = Presenter.errorResponse(error);

      expect(response).toEqual({
        content: [
          {
            type: "text",
            text: "Error: Something went wrong",
          },
        ],
        isError: true,
      });
    });
  });

  describe("fromResult", () => {
    it("should generate success response from success result", () => {
      const data = { message: "success" };
      const result = success(data);
      const response = Presenter.fromResult(result);

      expect(response.content[0].text).toBe(JSON.stringify(data, null, 2));
      expect(response.isError).toBeUndefined();
    });

    it("should generate error response from failure result", () => {
      const error = new Error("test error");
      const result = failure(error);
      const response = Presenter.fromResult(result);

      expect(response.content[0].text).toBe("Error: test error");
      expect(response.isError).toBe(true);
    });
  });
});
