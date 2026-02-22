import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlocksInteractor } from "../../../../src/application/interactors/BlocksInteractor.js";
import type { NotionClient } from "../../../../src/infrastructure/clients/index.js";
import type { IFileStorage } from "../../../../src/domain/services/index.js";
import { success } from "../../../../src/domain/types/index.js";

// Mock dependencies
const mockNotionClient = {
  listBlockChildren: vi.fn(),
  appendBlockChildren: vi.fn(),
} as unknown as NotionClient;

const mockFileStorage = {
  saveToWorkspace: vi.fn(),
  readFromFile: vi.fn(),
} as unknown as IFileStorage;

describe("BlocksInteractor", () => {
  let blocksInteractor: BlocksInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    blocksInteractor = new BlocksInteractor(mockNotionClient, mockFileStorage);
  });

  describe("retrieveBlockChildren", () => {
    it("should always save children to file", async () => {
      const blockId = "test-block-id";
      const mockChildren = { results: [{ id: "child-1" }] };
      const savedPath = "/workspace/saved-blocks.json";

      (mockNotionClient.listBlockChildren as any).mockResolvedValue(mockChildren);
      (mockFileStorage.saveToWorkspace as any).mockReturnValue(savedPath);

      const result = await blocksInteractor.retrieveBlockChildren({
        block_id: blockId,
      });

      expect(mockNotionClient.listBlockChildren).toHaveBeenCalledWith({ block_id: blockId });
      expect(mockFileStorage.saveToWorkspace).toHaveBeenCalledWith(
        JSON.stringify(mockChildren, null, 2),
        "mcp-notion-blocks",
        blockId,
      );

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.content_saved_to).toBe(savedPath);
      }
    });
  });

  describe("appendBlockChildren", () => {
    it("should read children from file and append them", async () => {
      const blockId = "test-block-id";
      const filePath = "/workspace/new-blocks.json";
      const fileContent = JSON.stringify({ children: [{ type: "paragraph" }] });
      const mockResult = { results: [{ id: "new-child-1" }] };

      (mockFileStorage.readFromFile as any).mockReturnValue(fileContent);
      (mockNotionClient.appendBlockChildren as any).mockResolvedValue(mockResult);

      const result = await blocksInteractor.appendBlockChildren({
        block_id: blockId,
        file_path: filePath,
        children: [], // Originally empty, filled from file
      });

      expect(mockFileStorage.readFromFile).toHaveBeenCalledWith(filePath);
      // Verify that children from file are merged
      expect(mockNotionClient.appendBlockChildren).toHaveBeenCalledWith(
        expect.objectContaining({
          children: [{ type: "paragraph" }],
        }),
      );
      expect(result.isSuccess()).toBe(true);
    });
  });
});
