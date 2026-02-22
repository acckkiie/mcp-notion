import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabasesInteractor } from "../../../../src/application/interactors/DatabasesInteractor.js";
import type { NotionClient } from "../../../../src/infrastructure/clients/index.js";
import type { IFileStorage } from "../../../../src/domain/services/index.js";
import { success } from "../../../../src/domain/types/index.js";

// Mock dependencies
const mockNotionClient = {
  queryDatabase: vi.fn(),
  retrieveDatabase: vi.fn(),
} as unknown as NotionClient;

const mockFileStorage = {
  saveToWorkspace: vi.fn(),
} as unknown as IFileStorage;

describe("DatabasesInteractor", () => {
  let databasesInteractor: DatabasesInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    databasesInteractor = new DatabasesInteractor(mockNotionClient, mockFileStorage);
  });

  describe("queryDatabase", () => {
    it("should always save results to file", async () => {
      const databaseId = "test-db-id";
      const mockResults = { results: [{ id: "page-1" }] };
      const savedPath = "/workspace/saved-db.json";

      (mockNotionClient.queryDatabase as any).mockResolvedValue(mockResults);
      (mockFileStorage.saveToWorkspace as any).mockReturnValue(savedPath);

      const result = await databasesInteractor.queryDatabase({
        database_id: databaseId,
      });

      expect(mockNotionClient.queryDatabase).toHaveBeenCalledWith({ database_id: databaseId });
      expect(mockFileStorage.saveToWorkspace).toHaveBeenCalledWith(
        JSON.stringify(mockResults, null, 2),
        "mcp-notion-database",
        expect.any(String),
      );

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.content_saved_to).toBe(savedPath);
      }
    });
  });

  describe("retrieveDatabase", () => {
    it("should always save metadata to file", async () => {
      const databaseId = "test-db-id";
      const mockDb = { id: databaseId, object: "database" };
      const savedPath = "/workspace/saved-db-meta.json";

      (mockNotionClient.retrieveDatabase as any).mockResolvedValue(mockDb);
      (mockFileStorage.saveToWorkspace as any).mockReturnValue(savedPath);

      const result = await databasesInteractor.retrieveDatabase({
        database_id: databaseId,
      });

      expect(mockNotionClient.retrieveDatabase).toHaveBeenCalledWith({ database_id: databaseId });
      expect(mockFileStorage.saveToWorkspace).toHaveBeenCalledWith(
        JSON.stringify(mockDb, null, 2),
        "mcp-notion-database-meta",
        databaseId,
      );

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.content_saved_to).toBe(savedPath);
      }
    });
  });
});
