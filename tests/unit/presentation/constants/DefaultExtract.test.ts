import { describe, it, expect } from "vitest";
import {
  EXTRACT_NONE,
  DEFAULT_EXTRACT_FIELDS,
  getDefaultExtract,
} from "../../../../src/presentation/constants/DefaultExtract.js";

describe("DefaultExtract", () => {
  describe("EXTRACT_NONE", () => {
    it("should be 'none'", () => {
      expect(EXTRACT_NONE).toBe("none");
    });
  });

  describe("DEFAULT_EXTRACT_FIELDS", () => {
    it("should have entries for all Notion tools", () => {
      const expectedTools = [
        "notion_retrieve_page",
        "notion_create_page",
        "notion_update_page",
        "notion_retrieve_block_children",
        "notion_append_block_children",
        "notion_query_database",
        "notion_retrieve_database",
        "notion_search",
      ];

      for (const tool of expectedTools) {
        expect(DEFAULT_EXTRACT_FIELDS).toHaveProperty(tool);
      }
    });
  });

  describe("getDefaultExtract", () => {
    it("should return correct default fields for notion_retrieve_page", () => {
      expect(getDefaultExtract("notion_retrieve_page")).toEqual(["content_saved_to", "id"]);
    });

    it("should return correct default fields for notion_create_page", () => {
      expect(getDefaultExtract("notion_create_page")).toEqual(["id", "url"]);
    });

    it("should return correct default fields for notion_update_page", () => {
      expect(getDefaultExtract("notion_update_page")).toEqual(["id", "url"]);
    });

    it("should return correct default fields for notion_retrieve_block_children", () => {
      expect(getDefaultExtract("notion_retrieve_block_children")).toEqual(["content_saved_to"]);
    });

    it("should return correct default fields for notion_append_block_children", () => {
      expect(getDefaultExtract("notion_append_block_children")).toEqual(["results"]);
    });

    it("should return correct default fields for notion_query_database", () => {
      expect(getDefaultExtract("notion_query_database")).toEqual(["content_saved_to"]);
    });

    it("should return correct default fields for notion_retrieve_database", () => {
      expect(getDefaultExtract("notion_retrieve_database")).toEqual(["content_saved_to", "id"]);
    });

    it("should return correct default fields for notion_search", () => {
      expect(getDefaultExtract("notion_search")).toEqual(["content_saved_to", "id"]);
    });

    it("should return null for unknown tool", () => {
      expect(getDefaultExtract("unknown_tool")).toBeNull();
    });
  });
});
