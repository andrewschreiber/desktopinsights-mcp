#!/usr/bin/env node

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';

import { DesktopInsightsClient } from './client';
import { loadConfig } from './config';
import { registerCategoryTools } from './tools/categories';
import { registerCompareTools } from './tools/compare';
import { registerLookupTools } from './tools/lookup';
import { registerSearchTools } from './tools/search';
import { SDK_CATEGORIES } from './types';

function createMcpServer(config: { apiKey: string; apiUrl: string }) {
  const client = new DesktopInsightsClient({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
  });

  const server = new McpServer({
    name: 'desktopinsights',
    version: '0.2.0',
  });

  registerLookupTools(server, client);
  registerSearchTools(server, client);
  registerCompareTools(server, client);
  registerCategoryTools(server);

  // Resources
  server.resource(
    'sdk-categories',
    'desktopinsights://sdk-categories',
    { description: 'All 11 SDK categories tracked by Desktop Insights with field names and examples' },
    async () => ({
      contents: [
        {
          uri: 'desktopinsights://sdk-categories',
          mimeType: 'application/json',
          text: JSON.stringify(SDK_CATEGORIES, null, 2),
        },
      ],
    }),
  );

  server.resource(
    'app-profile',
    new ResourceTemplate('desktopinsights://apps/{slug}', { list: undefined }),
    { description: 'Technology profile for a specific app' },
    async (uri, variables) => {
      const slug = variables.slug as string;
      const response = await client.lookup(slug);
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  );

  // Prompts
  server.prompt(
    'analyze-stack',
    'Analyze the technology stack of a desktop application',
    { app: z.string().describe('App name (e.g., "Figma", "Slack")') },
    ({ app }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Use the lookup_app tool to look up "${app}", then provide a detailed analysis of its technology stack. Cover:\n1. Runtime and framework choices\n2. SDK selections across all categories\n3. Notable dependencies\n4. How its stack compares to industry norms`,
          },
        },
      ],
    }),
  );

  server.prompt(
    'competitive-analysis',
    'Compare technology stacks of two competing desktop applications',
    {
      app1: z.string().describe('First app name'),
      app2: z.string().describe('Second app name'),
    },
    ({ app1, app2 }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Use the compare_apps tool to compare "${app1}" and "${app2}", then provide a competitive analysis. Cover:\n1. Key technology differences\n2. Which app has a more modern stack\n3. Shared technology choices\n4. Strategic implications of their SDK choices`,
          },
        },
      ],
    }),
  );

  server.prompt(
    'sdk-adoption',
    'Research adoption of a specific SDK across desktop applications',
    { sdk: z.string().describe('SDK name (e.g., "Sentry", "Stripe")') },
    ({ sdk }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Use the search_apps and list_sdk_categories tools to research the adoption of "${sdk}" across desktop applications. Find which apps use it, identify the category it belongs to, and summarize:\n1. Total number of apps using this SDK\n2. Notable apps in the list\n3. Common alternative SDKs in the same category\n4. Platform distribution (macOS vs Windows)`,
          },
        },
      ],
    }),
  );

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
