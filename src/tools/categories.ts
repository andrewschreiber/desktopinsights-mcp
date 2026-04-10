import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { SDK_CATEGORIES } from '../types';

export function registerCategoryTools(server: McpServer) {
  server.tool(
    'list_sdk_categories',
    'List all 11 SDK categories tracked by Desktop Insights with their API field names and example SDKs for each. Use this to discover what filters are available for search_apps, or to understand the sdkSummary fields returned by lookup_app.',
    async () => {
      const lines = SDK_CATEGORIES.map(
        (cat) =>
          `- **${cat.name}** (field: \`${cat.field}\`)\n  Examples: ${cat.examples.join(', ')}`,
      );

      return {
        content: [
          {
            type: 'text' as const,
            text:
              `Desktop Insights tracks 11 SDK categories across 12,000+ macOS and Windows desktop apps:\n\n` +
              `${lines.join('\n\n')}\n\n` +
              `Use these field names as filters in search_apps. Pass "null" as the value to find apps without that SDK type.`,
          },
        ],
      };
    },
  );
}
