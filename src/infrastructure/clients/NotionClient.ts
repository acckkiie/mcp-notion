import { Client } from "@notionhq/client";
import type {
  QueryDatabaseParameters,
  QueryDatabaseResponse,
  GetDatabaseParameters,
  GetDatabaseResponse,
  GetPageParameters,
  GetPageResponse,
  CreatePageParameters,
  CreatePageResponse,
  UpdatePageParameters,
  UpdatePageResponse,
  GetBlockParameters,
  GetBlockResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  AppendBlockChildrenParameters,
  AppendBlockChildrenResponse,
  SearchParameters,
  SearchResponse,
} from "@notionhq/client/build/src/api-endpoints.js";

import { NotionApiError } from "../../domain/errors/index.js";
import { HttpsProxyAgent } from "https-proxy-agent";

/**
 * Notion API Client wrapper
 * Handles all communication with Notion API
 */
export class NotionClient {
  private client: Client;



  constructor(auth: string, options?: { timeoutMs?: number }) {
    const clientOptions: any = {
      auth,
      timeoutMs: options?.timeoutMs || 30000,
    };

    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxyUrl) {
      console.error(`[NotionClient] Using Proxy: ${proxyUrl}`);
      clientOptions.agent = new HttpsProxyAgent(proxyUrl);
    } else {
      console.error("[NotionClient] No Proxy configured");
    }

    this.client = new Client(clientOptions);
  }

  /**
   * Query a database
   */
  async queryDatabase(params: QueryDatabaseParameters): Promise<QueryDatabaseResponse> {
    try {
      return await this.client.databases.query(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Retrieve a database
   */
  async retrieveDatabase(params: GetDatabaseParameters): Promise<GetDatabaseResponse> {
    try {
      return await this.client.databases.retrieve(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Retrieve a page
   */
  async retrievePage(params: GetPageParameters): Promise<GetPageResponse> {
    try {
      return await this.client.pages.retrieve(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a page
   */
  async createPage(params: CreatePageParameters): Promise<CreatePageResponse> {
    try {
      return await this.client.pages.create(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a page
   */
  async updatePage(params: UpdatePageParameters): Promise<UpdatePageResponse> {
    try {
      return await this.client.pages.update(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Retrieve a block
   */
  async retrieveBlock(params: GetBlockParameters): Promise<GetBlockResponse> {
    try {
      return await this.client.blocks.retrieve(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List block children
   */
  async listBlockChildren(params: ListBlockChildrenParameters): Promise<ListBlockChildrenResponse> {
    try {
      return await this.client.blocks.children.list(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Append block children
   */
  async appendBlockChildren(
    params: AppendBlockChildrenParameters,
  ): Promise<AppendBlockChildrenResponse> {
    try {
      return await this.client.blocks.children.append(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search
   */
  async search(params: SearchParameters): Promise<SearchResponse> {
    try {
      return await this.client.search(params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and convert Notion API errors to domain errors
   */
  private handleError(error: unknown): NotionApiError {
    if (error instanceof Error) {
      const notionError = error as any;
      return new NotionApiError(
        notionError.message || "Notion API error occurred",
        notionError.status,
        {
          code: notionError.code,
          originalError: error,
        },
      );
    }
    return new NotionApiError("Unknown error occurred");
  }
}
