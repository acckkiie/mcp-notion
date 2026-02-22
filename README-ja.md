# MCP Server for Notion

このツールは、Notion API を MCP (Model Context Protocol) サーバーとして提供するものである。
AI エージェントが Notion ページの検索、閲覧、作成、更新、およびデータベース操作を行うことを可能にする。

## 特徴

* ページおよびデータベース操作: 検索、取得、作成、更新、ブロック追加などの主要な操作をサポートする。
* ファイルベースの操作: ページコンテンツ (JSON) をファイルに保存/読み込みすることで、LLM のトークン使用量を大幅に削減する。

## クイックスタート

### ローカル開発環境

Node.js (v22 以上) が必要である。

1. インストール:

    ```bash
    git clone <repository-url>
    cd mcp-notion
    npm install
    ```

2. 設定:
    `.env.example` をコピーして `.env` を作成し、Notion API キーを設定する。

    ```bash
    cp .env.example .env
    # .env を編集: NOTION_API_KEY=secret_...
    ```

3. 実行:

    ```bash
    npm run dev
    ```

### イメージビルド

```bash
npm run build
docker build -t mcp-notion:latest .
```

## MCP クライアント設定

Claude Desktop やその他の MCP クライアントで使用するための設定例を示す。

### Docker 経由 (推奨)

Docker を使用することで環境依存を減らし、プロキシによるセキュリティ制御を可能にする。

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

### ローカル実行

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

## ライセンス

[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)
