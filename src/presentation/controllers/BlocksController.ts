import type { BlocksInteractor } from "../../application/interactors/index.js";
import { BaseController } from "./BaseController.js";

/**
 * Blocks Controller
 * Handles MCP tools for Blocks API
 */
export class BlocksController extends BaseController {
  static readonly TOOL_NAMES = ["notion_retrieve_block_children", "notion_append_block_children"];

  constructor(private blocksInteractor: BlocksInteractor) {
    super();
  }

  /**
   * Get tool definitions
   */
  getTools(): any[] {
    return [
      {
        name: "notion_retrieve_block_children",
        description:
          "Retrieves child blocks (paragraphs, headings, lists, etc.) of page or block. Supports pagination",
        inputSchema: {
          type: "object",
          properties: {
            block_id: {
              type: "string",
              description: "Block ID or page ID",
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
              description: "Fields to extract from response",
            },
          },
          required: ["block_id"],
        },
      },
      {
        name: "notion_append_block_children",
        description: "Appends content blocks (paragraphs, headings, to_do, lists) to page or block",
        inputSchema: {
          type: "object",
          properties: {
            block_id: {
              type: "string",
              description: "Parent block ID",
            },
            children: {
              type: "array",
              description: "Array of block objects to append",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "paragraph",
                      "heading_1",
                      "heading_2",
                      "heading_3",
                      "to_do",
                      "bulleted_list_item",
                      "numbered_list_item",
                    ],
                  },
                  paragraph: { type: "object" },
                  heading_1: { type: "object" },
                  heading_2: { type: "object" },
                  heading_3: { type: "object" },
                  to_do: { type: "object" },
                  bulleted_list_item: { type: "object" },
                  numbered_list_item: { type: "object" },
                },
              },
            },
            file_path: {
              type: "string",
              description:
                "Path to file containing children blocks (JSON). If specified, children are read from file.",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description: "Fields to extract from response",
            },
          },
          required: ["block_id"],
        },
      },
    ];
  }

  /**
   * Handle tool execution
   */
  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case "notion_retrieve_block_children":
        return this.handleWithExtract(args, (a) => this.blocksInteractor.retrieveBlockChildren(a));

      case "notion_append_block_children":
        return this.handleWithExtract(args, (a) => this.blocksInteractor.appendBlockChildren(a));

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
