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
  RetrievePageInput,
  CreatePageInput,
  UpdatePageInput,
  PageOutput,
} from "../models/index.js";

/**
 * Pages Interactor
 * Handles business logic for Notion Pages API
 */
export class PagesInteractor {
  constructor(
    private readonly notionClient: NotionClient,
    private readonly fileStorage: IFileStorage,
  ) {}

  /**
   * Retrieve a page by ID
   */
  async retrievePage(input: RetrievePageInput): Promise<Result<PageOutput, DomainError>> {
    try {
      const page = await this.notionClient.retrievePage({
        page_id: input.page_id,
      });

      let content_saved_to: string | undefined;
      if (input.save_to_file) {
        const formatted = JSON.stringify(page, null, 2);
        content_saved_to = this.fileStorage.saveToWorkspace(
          formatted,
          "mcp-notion-page",
          input.page_id,
        );
        // Remove large fields to reduce token usage
        (page as any).properties = undefined;
      }

      return success({ ...page, content_saved_to } as PageOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Create a new page
   */
  async createPage(input: CreatePageInput): Promise<Result<PageOutput, DomainError>> {
    try {
      let requestBody: any = input;

      if (input.file_path) {
        try {
          const fileContent = this.fileStorage.readFromFile(input.file_path);
          requestBody = JSON.parse(fileContent);
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new JsonParseError(input.file_path, parseError as Error);
          }
          throw new FileReadError(input.file_path, parseError as Error);
        }
      }

      const page = await this.notionClient.createPage(requestBody);
      return success(page as PageOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(input: UpdatePageInput): Promise<Result<PageOutput, DomainError>> {
    try {
      let requestBody: any = input;

      if (input.file_path) {
        try {
          const fileContent = this.fileStorage.readFromFile(input.file_path);
          const fileData = JSON.parse(fileContent);
          const { file_path, ...rest } = input;
          requestBody = { ...fileData, ...rest };
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new JsonParseError(input.file_path, parseError as Error);
          }
          throw new FileReadError(input.file_path, parseError as Error);
        }
      }

      const page = await this.notionClient.updatePage(requestBody);
      return success(page as PageOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }
}
