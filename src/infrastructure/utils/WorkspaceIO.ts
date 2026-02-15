import fs from "node:fs";
import type { IFileStorage } from "../../domain/services/index.js";
import { FileSystemError } from "../../domain/errors/index.js";
import { getLogger } from "./Logger.js";

/**
 * Workspace file I/O implementation
 * Implements IFileStorage interface defined in Domain layer
 */
export class WorkspaceIO implements IFileStorage {
  private readonly logger = getLogger("WorkspaceIO");

  private getInternalPath(): string {
    // Container: /workspace is mounted
    if (fs.existsSync("/workspace")) {
      return "/workspace";
    }

    // Local: use HOST_WORKSPACE_PATH
    const hostPath = process.env.HOST_WORKSPACE_PATH;
    if (!hostPath) {
      this.logger.error("HOST_WORKSPACE_PATH is not defined");
      throw new FileSystemError("HOST_WORKSPACE_PATH is required", "config");
    }
    return hostPath;
  }

  private getDisplayPath(): string {
    const hostPath = process.env.HOST_WORKSPACE_PATH;
    if (!hostPath) {
      this.logger.error("HOST_WORKSPACE_PATH is not defined");
      throw new FileSystemError("HOST_WORKSPACE_PATH is required", "config");
    }
    return hostPath;
  }

  /**
   * Validate file path to prevent security issues
   */
  private validatePath(filePath: string): void {
    // Path traversal attack prevention
    if (filePath.includes("..")) {
      this.logger.warn(`Path traversal attempt detected: ${filePath}`);
      throw new FileSystemError("Path traversal detected", "validate", undefined, { filePath });
    }
  }

  saveToWorkspace(content: string, prefix: string, identifier: string, extension = "json"): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    const filename = `${prefix}-${identifier}-${timestamp}.${extension}`;

    const internalDir = this.getInternalPath();
    const internalPath = `${internalDir}/${filename}`;

    const displayDir = this.getDisplayPath();
    const displayPath = `${displayDir}/${filename}`;

    try {
      // Ensure directory exists
      if (!fs.existsSync(internalDir)) {
        fs.mkdirSync(internalDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(internalPath, content, "utf-8");
      this.logger.info(`Saved content to file: ${displayPath}`);

      return displayPath;
    } catch (error) {
      this.logger.error(`Failed to save file: ${internalPath}`, error);
      throw new FileSystemError(`Failed to save file: ${internalPath}`, "save", error as Error, {
        filepath: internalPath,
      });
    }
  }

  readFromFile(filePath: string): string {
    this.validatePath(filePath);

    const resolvedPath = this.convertPath(filePath);

    if (!fs.existsSync(resolvedPath)) {
      this.logger.error(`File not found: ${resolvedPath} (Original: ${filePath})`);
      throw new FileSystemError("File not found", "read", undefined, {
        filePath,
        resolvedPath,
      });
    }

    try {
      const content = fs.readFileSync(resolvedPath, "utf-8");
      this.logger.info(`Read content from file: ${resolvedPath}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to read file: ${resolvedPath}`, error);
      throw new FileSystemError(`Failed to read file: ${resolvedPath}`, "read", error as Error, {
        filePath,
        resolvedPath,
      });
    }
  }

  private convertPath(filePath: string): string {
    const hostPath = process.env.HOST_WORKSPACE_PATH;
    if (hostPath && filePath.startsWith(hostPath)) {
      const internalPath = this.getInternalPath();
      return filePath.replace(hostPath, internalPath);
    }
    return filePath;
  }
}
