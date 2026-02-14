import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WorkspaceIO } from "../../../../src/infrastructure/utils/WorkspaceIO.js";
import fs from "node:fs";
import path from "node:path";
import { FileSystemError } from "../../../../src/domain/errors/index.js";

const TEMP_DIR = "tests/fixtures/temp";

describe("WorkspaceIO", () => {
  let workspaceIO: WorkspaceIO;

  beforeEach(() => {
    process.env.HOST_WORKSPACE_PATH = TEMP_DIR;
    workspaceIO = new WorkspaceIO();

    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    process.env.HOST_WORKSPACE_PATH = undefined;
  });

  describe("saveToWorkspace", () => {
    it("should save content to file and return filepath", () => {
      const content = JSON.stringify({ test: "data" });
      const prefix = "test-prefix";
      const identifier = "test-id";

      const filepath = workspaceIO.saveToWorkspace(content, prefix, identifier);

      expect(filepath).toContain(TEMP_DIR);
      expect(filepath).toContain(prefix);
      expect(filepath).toContain(identifier);
      expect(fs.existsSync(filepath)).toBe(true);

      const savedContent = fs.readFileSync(filepath, "utf-8");
      expect(savedContent).toBe(content);
    });
  });

  describe("readFromFile", () => {
    it("should read content from existing file", () => {
      const filename = "test-read.json";
      const filepath = path.join(TEMP_DIR, filename);
      const content = JSON.stringify({ test: "read" });
      fs.writeFileSync(filepath, content);

      const readContent = workspaceIO.readFromFile(filepath);
      expect(readContent).toBe(content);
    });

    it("should throw FileSystemError when file does not exist", () => {
      const filepath = path.join(TEMP_DIR, "non-existent.json");

      expect(() => workspaceIO.readFromFile(filepath)).toThrow(FileSystemError);
    });

    it("should throw FileSystemError for path traversal attempt", () => {
      const filepath = path.join(TEMP_DIR, "../outside.json");

      expect(() => workspaceIO.readFromFile(filepath)).toThrow(FileSystemError);
    });
  });
});
