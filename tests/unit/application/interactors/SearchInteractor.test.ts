import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchInteractor } from "../../../../src/application/interactors/SearchInteractor.js";
import type { NotionClient } from "../../../../src/infrastructure/clients/index.js";
import type { IFileStorage } from "../../../../src/domain/services/index.js";
import { success } from "../../../../src/domain/types/index.js";

// Mock dependencies
const mockNotionClient = {
  search: vi.fn(),
} as unknown as NotionClient;

const mockFileStorage = {
  saveToWorkspace: vi.fn(),
} as unknown as IFileStorage;

describe("SearchInteractor", () => {
  let searchInteractor: SearchInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    searchInteractor = new SearchInteractor(mockNotionClient, mockFileStorage);
  });

  describe("search", () => {
    it("should always save search results to file", async () => {
      const query = "test query";
      const mockResults = { results: [{ id: "result-1" }] };
      const savedPath = "/workspace/saved-search.json";

      (mockNotionClient.search as any).mockResolvedValue(mockResults);
      (mockFileStorage.saveToWorkspace as any).mockReturnValue(savedPath);

      const result = await searchInteractor.search({
        query: query,
      });

      expect(mockNotionClient.search).toHaveBeenCalledWith({ query: query });
      expect(mockFileStorage.saveToWorkspace).toHaveBeenCalledWith(
        JSON.stringify(mockResults, null, 2),
        "mcp-notion-search",
        expect.any(String),
      );

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.content_saved_to).toBe(savedPath);
      }
    });
  });
});
