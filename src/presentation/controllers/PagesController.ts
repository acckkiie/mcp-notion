import type { PagesInteractor } from "../../application/interactors/index.js";
import { BaseController } from "./BaseController.js";

/**
 * Pages Controller
 * Handles MCP tools for Pages API
 */
export class PagesController extends BaseController {
  static readonly TOOL_NAMES = ["notion_retrieve_page", "notion_create_page", "notion_update_page"];

  constructor(private pagesInteractor: PagesInteractor) {
    super();
  }

  /**
   * Get tool definitions
   */
  getTools(): any[] {
    return [
      {
        name: "notion_retrieve_page",
        description: "Retrieves page metadata: properties, parent, timestamps, archived status",
        inputSchema: {
          type: "object",
          properties: {
            page_id: {
              type: "string",
              description: "Page ID",
            },
            save_to_file: {
              type: "boolean",
              description: "Save page content to /workspace file to reduce token usage",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description: "Fields to extract (e.g., ['id', 'properties.title'])",
            },
          },
          required: ["page_id"],
        },
      },
      {
        name: "notion_create_page",
        description:
          "Creates page in database (requires properties) or as subpage (requires children blocks)",
        inputSchema: {
          type: "object",
          properties: {
            parent: {
              type: "object",
              description: "Parent page, database, or workspace",
              properties: {
                type: {
                  type: "string",
                  enum: ["page_id", "database_id", "workspace"],
                },
                page_id: { type: "string" },
                database_id: { type: "string" },
              },
              required: ["type"],
            },
            properties: {
              type: "object",
              description: "Page properties (required for database parent)",
            },
            children: {
              type: "array",
              description: "Array of block objects to append as page content",
            },
            file_path: {
              type: "string",
              description:
                "Path to file containing request body (JSON). If specified, properties and children are read from file.",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description: "Fields to extract from response",
            },
          },
          required: ["parent"],
        },
      },
      {
        name: "notion_update_page",
        description: "Updates page properties, archive status, icon, or cover image",
        inputSchema: {
          type: "object",
          properties: {
            page_id: {
              type: "string",
              description: "Page ID",
            },
            properties: {
              type: "object",
              description: "Page properties to update",
            },
            archived: {
              type: "boolean",
              description: "Whether the page is archived",
            },
            file_path: {
              type: "string",
              description: "Path to file containing updates (JSON). Merged with other params.",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description: "Fields to extract from response",
            },
          },
          required: ["page_id"],
        },
      },
    ];
  }

  /**
   * Handle tool execution
   */
  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case "notion_retrieve_page":
        return this.handleWithExtract(args, (a) => this.pagesInteractor.retrievePage(a));

      case "notion_create_page":
        return this.handleWithExtract(args, (a) => this.pagesInteractor.createPage(a));

      case "notion_update_page":
        return this.handleWithExtract(args, (a) => this.pagesInteractor.updatePage(a));

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
