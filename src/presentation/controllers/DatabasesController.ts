import type { DatabasesInteractor } from "../../application/interactors/index.js";
import { BaseController } from "./BaseController.js";

/**
 * Databases Controller
 * Handles MCP tools for Databases API
 */
export class DatabasesController extends BaseController {
  static readonly TOOL_NAMES = ["notion_query_database", "notion_retrieve_database"];

  constructor(private databasesInteractor: DatabasesInteractor) {
    super();
  }

  /**
   * Get tool definitions
   */
  getTools(): any[] {
    return [
      {
        name: "notion_query_database",
        description:
          "Queries database with filters/sorts. Returns array of pages (results). Supports pagination",
        inputSchema: {
          type: "object",
          properties: {
            database_id: {
              type: "string",
              description: "Database ID",
            },
            filter: {
              type: "object",
              description: "Filter object",
            },
            sorts: {
              type: "array",
              items: { type: "object" },
              description: "Sorts array",
            },
            start_cursor: {
              type: "string",
              description: "Pagination cursor",
            },
            page_size: {
              type: "number",
              description: "Number of results per page (max 100)",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['content_saved_to']. Use ['none'] to return all fields.",
            },
          },
          required: ["database_id"],
        },
      },
      {
        name: "notion_retrieve_database",
        description: "Retrieves database schema: property definitions, title, description",
        inputSchema: {
          type: "object",
          properties: {
            database_id: {
              type: "string",
              description: "Database ID",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['content_saved_to', 'id']. Use ['none'] to return all fields.",
            },
          },
          required: ["database_id"],
        },
      },
    ];
  }

  /**
   * Handle tool execution
   */
  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case "notion_query_database":
        return this.handleWithExtract(name, args, (a) => this.databasesInteractor.queryDatabase(a));

      case "notion_retrieve_database":
        return this.handleWithExtract(name, args, (a) =>
          this.databasesInteractor.retrieveDatabase(a),
        );

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Legacy method for compatibility
   */
  async handleTool(name: string, args: any): Promise<any> {
    return this.handleToolCall(name, args);
  }
}
