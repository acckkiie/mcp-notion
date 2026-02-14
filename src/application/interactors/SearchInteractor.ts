import type { NotionClient } from "../../infrastructure/clients/index.js";
import { type Result, success, failure } from "../../domain/types/index.js";
import { type NotionApiError, DomainError } from "../../domain/errors/index.js";
import type { IFileStorage } from "../../domain/services/index.js";
import type { SearchInput, SearchOutput } from "../models/index.js";

/**
 * Search Interactor
 * Handles business logic for Notion Search API
 */
export class SearchInteractor {
  constructor(
    private readonly notionClient: NotionClient,
    private readonly fileStorage: IFileStorage,
  ) {}

  /**
   * Search pages and databases
   */
  async search(input: SearchInput): Promise<Result<SearchOutput, DomainError>> {
    const { save_to_file, ...params } = input;
    try {
      const result = await this.notionClient.search(params);

      let content_saved_to: string | undefined;
      if (save_to_file) {
        const formatted = JSON.stringify(result, null, 2);
        content_saved_to = this.fileStorage.saveToWorkspace(
          formatted,
          "mcp-notion-search",
          Date.now().toString(),
        );
      }

      return success({ ...result, content_saved_to } as SearchOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }
}
