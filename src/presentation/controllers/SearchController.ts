import type { SearchInteractor } from "../../application/interactors/index.js";
import { BaseController } from "./BaseController.js";

/**
 * Search Controller
 * Handles MCP tools for Search API
 */
export class SearchController extends BaseController {
  static readonly TOOL_NAMES = ["notion_search"];

  constructor(private searchInteractor: SearchInteractor) {
    super();
  }

  /**
   * Get tool definitions
   */
  getTools(): any[] {
    return [
      {
        name: "notion_search",
        description:
          "Searches pages/databases by title. Filter by object type (page/database), sort by last_edited_time",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query string",
            },
            filter: {
              type: "object",
              description: "Optional filter object",
              properties: {
                value: {
                  type: "string",
                  enum: ["page", "database"],
                },
                property: {
                  type: "string",
                  const: "object",
                },
              },
            },
            sort: {
              type: "object",
              description: "Optional sort object",
              properties: {
                direction: {
                  type: "string",
                  enum: ["ascending", "descending"],
                },
                timestamp: {
                  type: "string",
                  const: "last_edited_time",
                },
              },
            },
            save_to_file: {
              type: "boolean",
              description: "Save search results to /workspace file to reduce token usage",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description: "Fields to extract from response",
            },
          },
          required: ["query"],
        },
      },
    ];
  }

  /**
   * Handle tool execution
   */
  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case "notion_search":
        return this.handleWithExtract(args, (a) => this.searchInteractor.search(a));

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
