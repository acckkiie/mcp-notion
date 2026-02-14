import { main } from "./server.js";

/**
 * Entry point for the MCP Notion server
 */
async function start(): Promise<void> {
  try {
    await main();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
});

// Start the server
start();
