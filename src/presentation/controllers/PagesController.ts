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
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['content_saved_to', 'id']. Use ['none'] to return all fields.",
            },
          },
          required: ["page_id"],
        },
      },
      {
        name: "notion_create_page",
        description:
          "IMPORTANT: You MUST write the JSON payload (including 'parent', 'properties', 'children') to a file first, then pass the file path in 'file_path'. Creates page in database or as subpage.",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description:
                "Path to file containing request body (JSON). JSON must include 'parent', 'properties' (if database), and optionally 'children'.",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['id', 'url']. Use ['none'] to return all fields.",
            },
          },
          required: ["file_path"],
        },
      },
      {
        name: "notion_update_page",
        description:
          "IMPORTANT: You MUST write the JSON payload to a file first, then pass the file path in 'file_path'. Updates page properties, archive status, icon, or cover.",
        inputSchema: {
          type: "object",
          properties: {
            page_id: {
              type: "string",
              description: "Page ID",
            },
            file_path: {
              type: "string",
              description:
                "Path to file containing updates (JSON). JSON should include 'properties', 'archived', 'icon', or 'cover'.",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['id', 'url']. Use ['none'] to return all fields.",
            },
          },
          required: ["page_id", "file_path"],
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
        return this.handleWithExtract(name, args, (a) => this.pagesInteractor.retrievePage(a));

      case "notion_create_page":
        return this.handleWithExtract(name, args, (a) => this.pagesInteractor.createPage(a));

      case "notion_update_page":
        return this.handleWithExtract(name, args, (a) => this.pagesInteractor.updatePage(a));

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
