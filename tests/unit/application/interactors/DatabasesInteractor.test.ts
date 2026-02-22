import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabasesInteractor } from "../../../../src/application/interactors/DatabasesInteractor.js";
import type { NotionClient } from "../../../../src/infrastructure/clients/index.js";
import type { IFileStorage } from "../../../../src/domain/services/index.js";
import { success } from "../../../../src/domain/types/index.js";

// Mock dependencies
const mockNotionClient = {
  queryDatabase: vi.fn(),
  retrieveDatabase: vi.fn(),
  createDatabase: vi.fn(),
  updateDatabase: vi.fn(),
} as unknown as NotionClient;

const mockFileStorage = {
  saveToWorkspace: vi.fn(),
  readFromFile: vi.fn(),
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

  describe("createDatabase", () => {
    it("should parse file content and call Notion API", async () => {
      const mockDb = { id: "new-db-id", object: "database" };
      const reqBody = { parent: { type: "page_id", page_id: "parent-id" }, title: [] };
      const filePath = "/workspace/create.json";

      (mockFileStorage.readFromFile as any).mockReturnValue(JSON.stringify(reqBody));
      (mockNotionClient.createDatabase as any).mockResolvedValue(mockDb);

      const result = await databasesInteractor.createDatabase({ file_path: filePath });

      expect(mockFileStorage.readFromFile).toHaveBeenCalledWith(filePath);
      expect(mockNotionClient.createDatabase).toHaveBeenCalledWith(reqBody);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toEqual(mockDb);
      }
    });

    it("should return failure on JSON parse error", async () => {
      const filePath = "/workspace/create-invalid.json";
      (mockFileStorage.readFromFile as any).mockReturnValue("{ invalid json");

      const result = await databasesInteractor.createDatabase({ file_path: filePath });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe("updateDatabase", () => {
    it("should merge database_id into parsed file content and call Notion API", async () => {
      const dbId = "existing-db-id";
      const mockDb = { id: dbId, object: "database" };
      const reqBody = { title: [] };
      const filePath = "/workspace/update.json";

      (mockFileStorage.readFromFile as any).mockReturnValue(JSON.stringify(reqBody));
      (mockNotionClient.updateDatabase as any).mockResolvedValue(mockDb);

      const result = await databasesInteractor.updateDatabase({
        database_id: dbId,
        file_path: filePath,
      });

      expect(mockFileStorage.readFromFile).toHaveBeenCalledWith(filePath);
      expect(mockNotionClient.updateDatabase).toHaveBeenCalledWith({
        ...reqBody,
        database_id: dbId,
      });
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toEqual(mockDb);
      }
    });

    it("should return failure on file read error", async () => {
      const filePath = "/workspace/missing.json";
      (mockFileStorage.readFromFile as any).mockImplementation(() => {
        throw new Error("Cannot read file");
      });

      const result = await databasesInteractor.updateDatabase({
        database_id: "db-id",
        file_path: filePath,
      });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });
});
