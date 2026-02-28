import type { BlocksInteractor } from "../../application/interactors/index.js";
import { BaseController } from "./BaseController.js";

/**
 * Blocks Controller
 * Handles MCP tools for Blocks API
 */
export class BlocksController extends BaseController {
  static readonly TOOL_NAMES = [
    "notion_retrieve_block_children",
    "notion_append_block_children",
    "notion_delete_block",
    "notion_retrieve_block",
    "notion_update_block",
  ];

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
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['content_saved_to']. Use ['none'] to return all fields.",
            },
          },
          required: ["block_id"],
        },
      },
      {
        name: "notion_append_block_children",
        description:
          "IMPORTANT: You MUST write the JSON payload (array of children) to a file first, then pass the file path in 'file_path'. Appends content blocks.",
        inputSchema: {
          type: "object",
          properties: {
            block_id: {
              type: "string",
              description: "Parent block ID",
            },
            file_path: {
              type: "string",
              description:
                "Path to file containing children blocks (JSON). JSON must include a 'children' array.",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['results']. Use ['none'] to return all fields.",
            },
          },
          required: ["block_id", "file_path"],
        },
      },
      {
        name: "notion_delete_block",
        description: "Deletes a block (sets in_trash: true).",
        inputSchema: {
          type: "object",
          properties: {
            block_id: {
              type: "string",
              description: "Block ID",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['id', 'in_trash']. Use ['none'] to return all fields.",
            },
          },
          required: ["block_id"],
        },
      },
      {
        name: "notion_retrieve_block",
        description: "Retrieves a block by ID.",
        inputSchema: {
          type: "object",
          properties: {
            block_id: {
              type: "string",
              description: "Block ID",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['content_saved_to', 'id']. Use ['none'] to return all fields.",
            },
          },
          required: ["block_id"],
        },
      },
      {
        name: "notion_update_block",
        description:
          "IMPORTANT: You MUST write the JSON payload to a file first, then pass the file path in 'file_path'. Updates a block.",
        inputSchema: {
          type: "object",
          properties: {
            block_id: {
              type: "string",
              description: "Block ID",
            },
            file_path: {
              type: "string",
              description: "Path to file containing block update payload (JSON).",
            },
            extract: {
              type: "array",
              items: { type: "string" },
              description:
                "Response fields to extract. If omitted, returns recommended fields: ['id', 'last_edited_time']. Use ['none'] to return all fields.",
            },
          },
          required: ["block_id", "file_path"],
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
        return this.handleWithExtract(name, args, (a) =>
          this.blocksInteractor.retrieveBlockChildren(a),
        );

      case "notion_append_block_children":
        return this.handleWithExtract(name, args, (a) =>
          this.blocksInteractor.appendBlockChildren(a),
        );

      case "notion_delete_block":
        return this.handleWithExtract(name, args, (a) => this.blocksInteractor.deleteBlock(a));

      case "notion_retrieve_block":
        return this.handleWithExtract(name, args, (a) => this.blocksInteractor.retrieveBlock(a));

      case "notion_update_block":
        return this.handleWithExtract(name, args, (a) => this.blocksInteractor.updateBlock(a));

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
