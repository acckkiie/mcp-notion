import fs from "node:fs";
import type { IFileStorage } from "../../domain/services/index.js";
import { FileSystemError } from "../../domain/errors/index.js";
import { getLogger } from "./Logger.js";

/**
 * Workspace file I/O implementation
 * Implements IFileStorage interface defined in Domain layer
 */
export class WorkspaceIO implements IFileStorage {
  private static readonly DEFAULT_WORKSPACE_DIR = "/workspace";
  private readonly logger = getLogger("WorkspaceIO");

  private getWorkspaceDir(): string {
    return process.env.HOST_WORKSPACE_PATH || WorkspaceIO.DEFAULT_WORKSPACE_DIR;
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

    // Only allow files under workspace directory (supports both container and local)
    const workspaceDir = this.getWorkspaceDir();
    const normalizedPath = filePath.replace(/\\/g, "/");

    // Container: starts with /workspace, Local: starts with HOST_WORKSPACE_PATH
    const isValidPath =
      normalizedPath.startsWith(WorkspaceIO.DEFAULT_WORKSPACE_DIR) ||
      (process.env.HOST_WORKSPACE_PATH &&
        normalizedPath.startsWith(process.env.HOST_WORKSPACE_PATH));

    if (!isValidPath) {
      this.logger.warn(`Access denied: path must be under ${workspaceDir}. Request: ${filePath}`);
      throw new FileSystemError(
        `Access denied: path must be under ${workspaceDir}`,
        "validate",
        undefined,
        { filePath, workspaceDir },
      );
    }
  }

  saveToWorkspace(content: string, prefix: string, identifier: string, extension = "json"): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    const filename = `${prefix}-${identifier}-${timestamp}.${extension}`;
    const workspaceDir = this.getWorkspaceDir();
    const filepath = `${workspaceDir}/${filename}`;

    try {
      // Ensure directory exists
      if (!fs.existsSync(workspaceDir)) {
        fs.mkdirSync(workspaceDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filepath, content, "utf-8");
      this.logger.info(`Saved content to file: ${filepath}`);

      return filepath;
    } catch (error) {
      this.logger.error(`Failed to save file: ${filepath}`, error);
      throw new FileSystemError(`Failed to save file: ${filepath}`, "save", error as Error, {
        filepath,
      });
    }
  }

  readFromFile(filePath: string): string {
    this.validatePath(filePath);

    const resolvedPath = this.convertPath(filePath);

    if (!fs.existsSync(resolvedPath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new FileSystemError("File not found", "read", undefined, {
        filePath,
      });
    }

    try {
      const content = fs.readFileSync(resolvedPath, "utf-8");
      this.logger.info(`Read content from file: ${filePath}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw new FileSystemError(`Failed to read file: ${filePath}`, "read", error as Error, {
        filePath,
      });
    }
  }

  private convertPath(filePath: string): string {
    // ファイルパスがそのまま使える（ローカル環境では絶対パス、コンテナでは /workspace）
    return filePath;
  }
}
