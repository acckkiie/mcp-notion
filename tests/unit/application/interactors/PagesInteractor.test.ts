import { describe, it, expect, vi, beforeEach } from "vitest";
import { PagesInteractor } from "../../../../src/application/interactors/PagesInteractor.js";
import type { NotionClient } from "../../../../src/infrastructure/clients/index.js";
import type { IFileStorage } from "../../../../src/domain/services/index.js";
import { success } from "../../../../src/domain/types/index.js";

// Mock dependencies
const mockNotionClient = {
  retrievePage: vi.fn(),
  createPage: vi.fn(),
  updatePage: vi.fn(),
} as unknown as NotionClient;

const mockFileStorage = {
  saveToWorkspace: vi.fn(),
  readFromFile: vi.fn(),
} as unknown as IFileStorage;

describe("PagesInteractor", () => {
  let pagesInteractor: PagesInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    pagesInteractor = new PagesInteractor(mockNotionClient, mockFileStorage);
  });

  describe("retrievePage", () => {
    it("should always save content to file", async () => {
      const pageId = "test-page-id";
      const mockPage = { id: pageId, object: "page", properties: { title: "Test" } };
      const savedPath = "/workspace/saved-page.json";

      (mockNotionClient.retrievePage as any).mockResolvedValue({ ...mockPage });
      (mockFileStorage.saveToWorkspace as any).mockReturnValue(savedPath);

      const result = await pagesInteractor.retrievePage({
        page_id: pageId,
      });

      expect(mockNotionClient.retrievePage).toHaveBeenCalledWith({ page_id: pageId });
      expect(mockFileStorage.saveToWorkspace).toHaveBeenCalledWith(
        JSON.stringify(mockPage, null, 2),
        "mcp-notion-page",
        pageId,
      );

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.content_saved_to).toBe(savedPath);
      }
    });
  });

  describe("createPage", () => {
    it("should read content from file when file_path is provided", async () => {
      const filePath = "/workspace/new-page.json";
      const fileContent = JSON.stringify({ properties: { title: "New Page" } });
      const mockCreatedPage = { id: "new-page-id", object: "page" };

      (mockFileStorage.readFromFile as any).mockReturnValue(fileContent);
      (mockNotionClient.createPage as any).mockResolvedValue(mockCreatedPage);

      const result = await pagesInteractor.createPage({
        parent: { type: "page_id", page_id: "parent-id" },
        file_path: filePath,
      });

      expect(mockFileStorage.readFromFile).toHaveBeenCalledWith(filePath);
      expect(mockNotionClient.createPage).toHaveBeenCalledWith(JSON.parse(fileContent));
      expect(result.isSuccess()).toBe(true);
    });
  });
});
