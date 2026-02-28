import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlocksInteractor } from "../../../../src/application/interactors/BlocksInteractor.js";
import type { NotionClient } from "../../../../src/infrastructure/clients/index.js";
import type { IFileStorage } from "../../../../src/domain/services/index.js";
import { success } from "../../../../src/domain/types/index.js";

// Mock dependencies
const mockNotionClient = {
  listBlockChildren: vi.fn(),
  appendBlockChildren: vi.fn(),
  deleteBlock: vi.fn(),
  retrieveBlock: vi.fn(),
  updateBlock: vi.fn(),
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
      });

      expect(mockFileStorage.readFromFile).toHaveBeenCalledWith(filePath);
      // Verify that children from file are merged along with the block ID
      expect(mockNotionClient.appendBlockChildren).toHaveBeenCalledWith(
        expect.objectContaining({
          block_id: blockId,
          children: [{ type: "paragraph" }],
        }),
      );
      expect(result.isSuccess()).toBe(true);
    });
  });

  describe("deleteBlock", () => {
    it("should call notionClient.deleteBlock and return success", async () => {
      const blockId = "test-block-id";
      const mockResult = { id: "test-block-id", object: "block", in_trash: true };

      (mockNotionClient.deleteBlock as any).mockResolvedValue(mockResult);

      const result = await blocksInteractor.deleteBlock({ block_id: blockId });

      expect(mockNotionClient.deleteBlock).toHaveBeenCalledWith({ block_id: blockId });
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toEqual(mockResult);
      }
    });
  });

  describe("retrieveBlock", () => {
    it("should retrieve a block and save it to file", async () => {
      const blockId = "test-block-id";
      const mockBlock = { id: blockId, object: "block" };
      const savedPath = "/workspace/saved-block.json";

      (mockNotionClient.retrieveBlock as any).mockResolvedValue(mockBlock);
      (mockFileStorage.saveToWorkspace as any).mockReturnValue(savedPath);

      const result = await blocksInteractor.retrieveBlock({ block_id: blockId });

      expect(mockNotionClient.retrieveBlock).toHaveBeenCalledWith({ block_id: blockId });
      expect(mockFileStorage.saveToWorkspace).toHaveBeenCalledWith(
        JSON.stringify(mockBlock, null, 2),
        "mcp-notion-block",
        blockId,
      );

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.content_saved_to).toBe(savedPath);
      }
    });
  });

  describe("updateBlock", () => {
    it("should read from file and update the block", async () => {
      const blockId = "test-block-id";
      const filePath = "/workspace/update-block.json";
      const fileContent = JSON.stringify({ paragraph: { rich_text: [{ text: { content: "Updated text" } }] } });
      const mockResult = { id: blockId, object: "block" };

      (mockFileStorage.readFromFile as any).mockReturnValue(fileContent);
      (mockNotionClient.updateBlock as any).mockResolvedValue(mockResult);

      const result = await blocksInteractor.updateBlock({
        block_id: blockId,
        file_path: filePath,
      });

      expect(mockFileStorage.readFromFile).toHaveBeenCalledWith(filePath);
      expect(mockNotionClient.updateBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          block_id: blockId,
          paragraph: { rich_text: [{ text: { content: "Updated text" } }] },
        }),
      );
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toEqual(mockResult);
      }
    });
  });
});
