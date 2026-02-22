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
  QueryDatabaseInput,
  RetrieveDatabaseInput,
  CreateDatabaseInput,
  UpdateDatabaseInput,
  DatabaseQueryOutput,
  DatabaseOutput,
} from "../models/index.js";

/**
 * Databases Interactor
 * Handles business logic for Notion Databases API
 */
export class DatabasesInteractor {
  constructor(
    private readonly notionClient: NotionClient,
    private readonly fileStorage: IFileStorage,
  ) {}

  /**
   * Query a database
   */
  async queryDatabase(
    input: QueryDatabaseInput,
  ): Promise<Result<DatabaseQueryOutput, DomainError>> {
    try {
      const result = await this.notionClient.queryDatabase(input);

      const formatted = JSON.stringify(result, null, 2);
      const timestamp = Date.now();
      const content_saved_to = this.fileStorage.saveToWorkspace(
        formatted,
        "mcp-notion-database",
        timestamp.toString(),
      );

      return success({ ...result, content_saved_to } as DatabaseQueryOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Retrieve a database
   */
  async retrieveDatabase(
    input: RetrieveDatabaseInput,
  ): Promise<Result<DatabaseOutput, DomainError>> {
    try {
      const result = await this.notionClient.retrieveDatabase({
        database_id: input.database_id,
      });

      const formatted = JSON.stringify(result, null, 2);
      const content_saved_to = this.fileStorage.saveToWorkspace(
        formatted,
        "mcp-notion-database-meta",
        input.database_id,
      );

      return success({ ...result, content_saved_to } as DatabaseOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Create a database
   */
  async createDatabase(input: CreateDatabaseInput): Promise<Result<DatabaseOutput, DomainError>> {
    try {
      let requestBody: any;

      try {
        const fileContent = this.fileStorage.readFromFile(input.file_path);
        requestBody = JSON.parse(fileContent);
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new JsonParseError(input.file_path, parseError as Error);
        }
        throw new FileReadError(input.file_path, parseError as Error);
      }

      const database = await this.notionClient.createDatabase(requestBody);
      return success(database as DatabaseOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }

  /**
   * Update an existing database
   */
  async updateDatabase(input: UpdateDatabaseInput): Promise<Result<DatabaseOutput, DomainError>> {
    try {
      let requestBody: any;

      try {
        const fileContent = this.fileStorage.readFromFile(input.file_path);
        const fileData = JSON.parse(fileContent);
        requestBody = { ...fileData, database_id: input.database_id };
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new JsonParseError(input.file_path, parseError as Error);
        }
        throw new FileReadError(input.file_path, parseError as Error);
      }

      const database = await this.notionClient.updateDatabase(requestBody);
      return success(database as DatabaseOutput);
    } catch (error) {
      if (error instanceof DomainError) {
        return failure(error);
      }
      return failure(error as NotionApiError);
    }
  }
}
