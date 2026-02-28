/**
 * Default extract field definitions for MCP tools.
 *
 * This module defines recommended response fields for each tool,
 * applied when extract parameter is omitted.
 */

// Special value to request all fields
export const EXTRACT_NONE = "none";

// Default extract fields for each tool
export const DEFAULT_EXTRACT_FIELDS: Record<string, string[]> = {
  // Pages tools
  notion_retrieve_page: ["content_saved_to", "id"],
  notion_create_page: ["id", "url"],
  notion_update_page: ["id", "url"],

  // Blocks tools
  notion_retrieve_block_children: ["content_saved_to"],
  notion_append_block_children: ["results"],
  notion_delete_block: ["id", "in_trash"],
  notion_retrieve_block: ["content_saved_to", "id"],
  notion_update_block: ["id", "last_edited_time"],

  // Databases tools
  notion_query_database: ["content_saved_to"],
  notion_retrieve_database: ["content_saved_to", "id"],

  // Search tools
  notion_search: ["content_saved_to", "id"],
};

/**
 * Get default extract fields for a tool.
 *
 * @param toolName - Name of the tool
 * @returns List of default extract fields, or null if no defaults defined.
 *          Returns empty list if tool exists but has no recommended fields.
 */
export function getDefaultExtract(toolName: string): string[] | null {
  if (!(toolName in DEFAULT_EXTRACT_FIELDS)) {
    return null;
  }

  const fields = DEFAULT_EXTRACT_FIELDS[toolName];
  return fields.length > 0 ? fields : null;
}
