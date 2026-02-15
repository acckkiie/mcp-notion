# MCP Server for Notion

Notion API を MCP (Model Context Protocol) サーバーとして提供するツールである。
AIエージェントがNotionのページ検索、閲覧、作成、更新、データベース操作を行うことを可能にする。

## 特徴

*   ページ・データベース操作: 検索、取得、作成、更新、ブロック追加など主要な操作をサポートする。
*   ファイルベース操作: ページ内容（JSON）をファイルに保存・読み込みすることで、LLMのトークン消費を大幅に削減する。
*   セキュリティ: Squidプロキシ経由での通信により、Notion API以外への不正なアクセスを遮断する（Docker構成時）。

## クイックスタート

### ローカル開発環境

Node.js (v22以上) が必要である。

1.  インストール:
    ```bash
    git clone <repository-url>
    cd mcp-notion
    npm install
    ```

2.  設定:
    `.env.example` をコピーして `.env` を作成し、Notion APIキーを設定する。
    ```bash
    cp .env.example .env
    # .env を編集: NOTION_API_KEY=secret_...
    ```

3.  実行:
    ```bash
    npm run dev
    ```

### イメージのビルド

```bash
docker build -t mcp-notion:latest .
```

## MCPクライアント設定 (Client Configuration)

Claude Desktopやその他のMCPクライアントで使用するための設定例である。

### Docker経由 (推奨)

Dockerを使用することで、環境依存の問題を減らし、プロキシによるセキュリティ制御が有効になる。

```json
{
  "mcpServers": {
    "notion": {
      "command": "docker",
      "args": [
        "compose",
        "-f",
        "/path/to/mcp-notion/docker-compose.yml",
        "run",
        "--rm",
        "-i",
        "mcp-notion"
      ],
      "env": {
        "HOST_WORKSPACE_PATH": "/path/to/your/workspace"
      }
    }
  }
}
```

### ローカル直接実行

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
