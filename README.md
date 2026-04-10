# Desktop Insights MCP Server

MCP server for [Desktop Insights](https://desktopinsights.com) — look up SDKs, frameworks, and dependencies used by 12,000+ macOS and Windows desktop applications.

## Quick Start

Get your API key at [desktopinsights.com/settings/api](https://desktopinsights.com/settings/api).

### Claude Code

```bash
claude mcp add desktopinsights -e DESKTOPINSIGHTS_API_KEY=your-api-key -- npx -y desktopinsights-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "desktopinsights": {
      "command": "npx",
      "args": ["-y", "desktopinsights-mcp"],
      "env": {
        "DESKTOPINSIGHTS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "desktopinsights": {
      "command": "npx",
      "args": ["-y", "desktopinsights-mcp"],
      "env": {
        "DESKTOPINSIGHTS_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Tools

### lookup_app

Look up what SDKs and dependencies a specific app uses.

```
"What SDKs does Figma use?"
"Look up the technology stack of 1Password"
"What error tracking does Slack use?"
```

### search_apps

Search apps by SDK usage, runtime, platform, or developer.

```
"Which apps use Sentry for error tracking?"
"Find all Electron apps that use Stripe"
"What apps does Microsoft publish on macOS?"
```

### compare_apps

Side-by-side technology stack comparison.

```
"Compare Figma vs Sketch"
"Compare Slack and Discord's tech stacks"
```

### list_sdk_categories

List all 11 tracked SDK categories with example values. Useful for discovering what filters are available.

## Configuration

| Environment Variable      | Required | Default                       |
| ------------------------- | -------- | ----------------------------- |
| `DESKTOPINSIGHTS_API_KEY` | Yes      | —                             |
| `DESKTOPINSIGHTS_API_URL` | No       | `https://desktopinsights.com` |

## Development

```bash
npm install
npm run build
DESKTOPINSIGHTS_API_KEY=your-key node build/index.js
```
