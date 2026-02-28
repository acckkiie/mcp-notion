import type { NotionClient } from "../../infrastructure/clients/index.js";
import { type Result, success, failure } from "../../domain/types/index.js";
import {
  type NotionApiError,
  DomainError,
  JsonParseError,
  FileReadError,
} from "../../domain/errors/index.js";
import type { IFileStorage } from "../../domain/services/index.js";
import type {
  RetrieveBlockChildrenInput,
  AppendBlockChildrenInput,
  BlockChildrenOutput,
  DeleteBlockInput,
  RetrieveBlockInput,
  UpdateBlockInput,
  BlockOutput,
} from "../models/index.js";

/**
 * Blocks Interactor
 * Handles business logic for Notion Blocks API
 */
export class BlocksInteractor {
  constructor(
    private readonly notionClient: NotionClient,
    private readonly fileStorage: IFileStorage,
  ) {}

  /**
   * Retrieve block children
   */
  async retrieveBlockChildren(
    input: RetrieveBlockChildrenInput,
  ): Promise<Result<BlockChildrenOutput, DomainError>> {
    try {
      const result = await this.notionClient.listBlockChildren(input);

      const formatted = JSON.stringify(result, null, 2);
      const content_saved_to = this.fileStorage.saveToWorkspace(
        formatted,
        "mcp-notion-blocks",
        input.block_id,
      );

      return success({ ...result, content_saved_to } as BlockChildrenOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Append block children
   */
  async appendBlockChildren(
    input: AppendBlockChildrenInput,
  ): Promise<Result<BlockChildrenOutput, DomainError>> {
    try {
      let requestBody: any;

      try {
        const fileContent = this.fileStorage.readFromFile(input.file_path);
        const fileData = JSON.parse(fileContent);
        // Merge file data with block_id
        requestBody = { block_id: input.block_id, ...fileData };
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new JsonParseError(input.file_path, parseError as Error);
        }
        throw new FileReadError(input.file_path, parseError as Error);
      }

      const result = await this.notionClient.appendBlockChildren(requestBody);
      return success(result as BlockChildrenOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Delete a block
   */
  async deleteBlock(input: DeleteBlockInput): Promise<Result<BlockOutput, DomainError>> {
    try {
      const result = await this.notionClient.deleteBlock(input);
      return success(result as BlockOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Retrieve a block
   */
  async retrieveBlock(input: RetrieveBlockInput): Promise<Result<BlockOutput, DomainError>> {
    try {
      const result = await this.notionClient.retrieveBlock(input);

      const formatted = JSON.stringify(result, null, 2);
      const content_saved_to = this.fileStorage.saveToWorkspace(
        formatted,
        "mcp-notion-block",
        input.block_id,
      );

      return success({ ...result, content_saved_to } as BlockOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Update a block
   */
  async updateBlock(input: UpdateBlockInput): Promise<Result<BlockOutput, DomainError>> {
    try {
      let requestBody: any;

      try {
        const fileContent = this.fileStorage.readFromFile(input.file_path);
        const fileData = JSON.parse(fileContent);
        // Merge file data with block_id
        requestBody = { block_id: input.block_id, ...fileData };
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new JsonParseError(input.file_path, parseError as Error);
        }
        throw new FileReadError(input.file_path, parseError as Error);
      }

      const result = await this.notionClient.updateBlock(requestBody);
      return success(result as BlockOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }
}
