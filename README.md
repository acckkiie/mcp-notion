# MCP Server for Notion

This tool provides the Notion API as an MCP (Model Context Protocol) server.
It enables AI agents to search, view, create, and update Notion pages, as well as operate on databases.

## Features

* Page & Database Operations: Supports major operations such as search, retrieval, creation, updates, and appending blocks.
* File-based Operations: Drastically reduces LLM token usage by saving/loading page content (JSON) to/from files.
* Security: Blocks unauthorized access to non-Notion APIs via Squid proxy (when configured with Docker).

## Quick Start

### Local Development Environment

Node.js (v22 or higher) is required.

1. Install:

    ```bash
    git clone <repository-url>
    cd mcp-notion
    npm install
    ```

2. Configure:
    Copy `.env.example` to create `.env` and set your Notion API key.

    ```bash
    cp .env.example .env
    # Edit .env: NOTION_API_KEY=secret_...
    ```

3. Run:

    ```bash
    npm run dev
    ```

### Image Build

```bash
npm run build
docker build -t mcp-notion:latest .
```

## MCP Client Configuration

Example configuration for using with Claude Desktop or other MCP clients.

### Via Docker (Recommended)

Using Docker reduces environment dependencies and enables security control via proxy.

```json
{
  "mcpServers": {
    "mcp-notion": {
      "disabled": false,
      "command": "bash",
      "args": [
        "-c",
        "docker compose -f /path/to/mcp-notion/docker-compose.yml down 2>/dev/null; docker compose --env-file /path/to/mcp-notion/.env -f /path/to/mcp-notion/docker-compose.yml run --rm -i mcp-notion"
      ],
      "env": {
        "HOST_WORKSPACE_PATH": "/path/to/your/workspace"
      }
    }
  }
}
```

### Local Execution

```json
{
  "mcpServers": {
    "notion": {
      "command": "node",
      "args": [
        "/path/to/mcp-notion/build/index.js"
      ],
      "env": {
        "NOTION_API_KEY": "secret_...",
        "HOST_WORKSPACE_PATH": "/path/to/your/workspace"
      }
    }
  }
}
```

## License

[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)
