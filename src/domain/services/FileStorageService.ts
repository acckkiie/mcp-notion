/**
 * File storage service interface for workspace file operations
 * This interface is defined in Domain layer, implemented in Infrastructure layer
 */
export interface IFileStorage {
  /**
   * Save content to workspace file
   * @param content - Content to save
   * @param prefix - Filename prefix
   * @param identifier - Unique identifier
   * @param extension - File extension (default: "json")
   * @returns Client-side file path
   */
  saveToWorkspace(content: string, prefix: string, identifier: string, extension?: string): string;

  /**
   * Read content from file
   * @param filePath - File path (client-side or container-side)
   * @returns File content
   */
  readFromFile(filePath: string): string;
}
