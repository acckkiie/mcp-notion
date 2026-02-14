import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { appConfig } from "./infrastructure/config/index.js";
import { StructuredLogger } from "./infrastructure/logging/index.js";
import { NotionClient } from "./infrastructure/clients/index.js";
import { WorkspaceIO } from "./infrastructure/utils/index.js";
import {
  PagesInteractor,
  DatabasesInteractor,
  BlocksInteractor,
  SearchInteractor,
} from "./application/interactors/index.js";
import {
  PagesController,
  DatabasesController,
  BlocksController,
  SearchController,
} from "./presentation/controllers/index.js";

const logger = new StructuredLogger("server");

/**
 * Main function to start the MCP server
 */
export async function main(): Promise<void> {
  try {
    // Configure logging
    const logConfig = appConfig.get("logger");
    StructuredLogger.configureLogging(logConfig);

    logger.info("Starting Notion MCP Server");

    // Initialize Notion client
    const notionApiKey = appConfig.get<string>("notion.apiKey");
    const requestTimeout = appConfig.get<number>("notion.requestTimeout");
    const notionClient = new NotionClient(notionApiKey, { timeoutMs: requestTimeout });

    // Initialize file storage
    const fileStorage = new WorkspaceIO();

    // Initialize Interactors with DI
    const pagesInteractor = new PagesInteractor(notionClient, fileStorage);
    const databasesInteractor = new DatabasesInteractor(notionClient, fileStorage);
    const blocksInteractor = new BlocksInteractor(notionClient, fileStorage);
    const searchInteractor = new SearchInteractor(notionClient, fileStorage);

    // Initialize Controllers
    const pagesController = new PagesController(pagesInteractor);
    const databasesController = new DatabasesController(databasesInteractor);
    const blocksController = new BlocksController(blocksInteractor);
    const searchController = new SearchController(searchInteractor);

    const controllers = [pagesController, databasesController, blocksController, searchController];

    // Create MCP server
    const server = new Server(
      {
        name: "mcp-notion",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    // Register tool list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug("Listing available tools");

      const tools = controllers.flatMap((controller) => controller.getTools()) as any;

      return { tools };
    });

    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info("Tool called", { toolName: name });

      if (!args) {
        logger.error("Tool arguments are missing", undefined, { toolName: name });
        return {
          content: [
            {
              type: "text",
              text: "Error: Tool arguments are required",
            },
          ],
          isError: true,
        };
      }

      try {
        // Find the appropriate controller
        for (const controller of controllers) {
          const controllerClass = controller.constructor as any;
          if (controllerClass.TOOL_NAMES.includes(name)) {
            return await controller.handleTool(name, args);
          }
        }

        // Tool not found
        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        logger.error("Tool execution failed", error as Error, { toolName: name });
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Notion MCP Server started successfully");
  } catch (error) {
    logger.fatal("Failed to start server", error as Error);
    process.exit(1);
  }
}
