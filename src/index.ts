#!/usr/bin/env node

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { DesktopInsightsClient } from './client';
import { loadConfig } from './config';
import { registerCategoryTools } from './tools/categories';
import { registerCompareTools } from './tools/compare';
import { registerLookupTools } from './tools/lookup';
import { registerSearchTools } from './tools/search';

function createMcpServer(config: { apiKey: string; apiUrl: string }) {
  const client = new DesktopInsightsClient({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
  });

  const server = new McpServer({
    name: 'desktopinsights',
    version: '0.1.0',
  });

  registerLookupTools(server, client);
  registerSearchTools(server, client);
  registerCompareTools(server, client);
  registerCategoryTools(server);

  return server;
}

async function main() {
  const config = loadConfig();
  const port = process.env.PORT ? Number(process.env.PORT) : undefined;

  if (port) {
    const sessions = new Map<string, StreamableHTTPServerTransport>();

    const server = createServer(async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;

      if (sessionId && sessions.has(sessionId)) {
        await sessions.get(sessionId)!.handleRequest(req, res);
        return;
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });
      transport.onclose = () => {
        if (transport.sessionId) sessions.delete(transport.sessionId);
      };

      const mcpServer = createMcpServer(config);
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res);

      if (transport.sessionId) sessions.set(transport.sessionId, transport);
    });

    server.listen(port, () => {
      console.error(`Desktop Insights MCP Server running on http://localhost:${port}/mcp`);
    });
  } else {
    const mcpServer = createMcpServer(config);
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error('Desktop Insights MCP Server running on stdio');
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
