#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { DesktopInsightsClient } from './client';
import { loadConfig } from './config';
import { registerCategoryTools } from './tools/categories';
import { registerCompareTools } from './tools/compare';
import { registerLookupTools } from './tools/lookup';
import { registerSearchTools } from './tools/search';

async function main() {
  const config = loadConfig();

  const client = new DesktopInsightsClient({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
  });

  const server = new McpServer({
    name: 'desktopinsights',
    version: '0.1.0',
  });

  const transport = new StdioServerTransport();

  registerLookupTools(server, client);
  registerSearchTools(server, client);
  registerCompareTools(server, client);
  registerCategoryTools(server);

  await server.connect(transport);

  console.error('Desktop Insights MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
