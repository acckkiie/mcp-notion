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
    it("should save content to internal path but return display path", () => {
      const content = JSON.stringify({ test: "data" });
      const prefix = "test-prefix";
      const identifier = "test-id";

      // Mock getInternalPath to return TEMP_DIR (simulating local/container write)
      // Since we are running tests locally, getInternalPath will use HOST_WORKSPACE_PATH (TEMP_DIR)
      // unless we mock fs.existsSync("/workspace").

      const displayPath = workspaceIO.saveToWorkspace(content, prefix, identifier);

      // Return value should be in display path (HOST_WORKSPACE_PATH -> TEMP_DIR)
      expect(displayPath).toContain(TEMP_DIR);
      expect(displayPath).toContain(prefix);

      // File should exist at the internal path (which is also TEMP_DIR in this test setup)
      expect(fs.existsSync(displayPath)).toBe(true);

      const savedContent = fs.readFileSync(displayPath, "utf-8");
      expect(savedContent).toBe(content);
    });

    it("should throw error if HOST_WORKSPACE_PATH is not set", () => {
      delete process.env.HOST_WORKSPACE_PATH;
      expect(() => workspaceIO.saveToWorkspace("{}", "p", "id")).toThrow("HOST_WORKSPACE_PATH is required");
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

    it("should handle host path conversion if internal path differs (mock scenario)", () => {
      // Setup hypothetical scenario:
      // HOST_WORKSPACE_PATH = /host/tmp
      // Internal Path = TEMP_DIR
      // Input path = /host/tmp/file.json

      const hostPath = "/private/tmp/host-workspace"; // Simulated host path
      process.env.HOST_WORKSPACE_PATH = hostPath;

      // Override getInternalPath to return TEMP_DIR
      vi.spyOn(workspaceIO as any, "getInternalPath").mockReturnValue(TEMP_DIR);

      const filename = "test-conversion.json";
      const internalFilePath = path.join(TEMP_DIR, filename); // The actual file
      const hostFilePath = path.join(hostPath, filename); // The path passed from outside

      const content = "conversion test";
      fs.writeFileSync(internalFilePath, content);

      const readContent = workspaceIO.readFromFile(hostFilePath);
      expect(readContent).toBe(content);
    });

    it("should throw FileSystemError when file does not exist", () => {
      const filepath = path.join(TEMP_DIR, "non-existent.json");

      expect(() => workspaceIO.readFromFile(filepath)).toThrow(FileSystemError);
    });
  });
});
