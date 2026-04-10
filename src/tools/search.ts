import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';

import type { DesktopInsightsClient } from '../client';
import { formatError } from '../utils';

export function registerSearchTools(
  server: McpServer,
  client: DesktopInsightsClient,
) {
  server.tool(
    'search_apps',
    'Search for desktop applications by SDK usage, runtime, platform, or developer. ' +
      'Use this to find which apps use a specific SDK (e.g., "Which apps use Sentry?"), ' +
      "discover technology adoption patterns, or research a developer's products. " +
      'Supports all 11 SDK categories, runtime (electron/native/qt/flutter), platform (macos/windows), and developer name. ' +
      'Pass "null" as an SDK value to find apps without that SDK type. ' +
      'At least one filter is required.',
    {
        errorTrackingSdk: z
          .string()
          .optional()
          .describe(
            'Filter by error tracking SDK (e.g., "Sentry", "Bugsnag"), or "null" for apps with none',
          ),
        analyticsSdk: z
          .string()
          .optional()
          .describe('Filter by analytics SDK (e.g., "Mixpanel", "Amplitude")'),
        featureFlagSdk: z
          .string()
          .optional()
          .describe('Filter by feature flag SDK (e.g., "LaunchDarkly")'),
        databaseSdk: z
          .string()
          .optional()
          .describe(
            'Filter by database SDK (e.g., "SQLite", "electron-store")',
          ),
        uiFramework: z
          .string()
          .optional()
          .describe('Filter by UI framework (e.g., "React", "Vue", "SwiftUI")'),
        stateManagement: z
          .string()
          .optional()
          .describe('Filter by state management (e.g., "Redux", "Zustand")'),
        paymentsSdk: z
          .string()
          .optional()
          .describe('Filter by payments SDK (e.g., "Stripe", "Paddle")'),
        authSdk: z
          .string()
          .optional()
          .describe('Filter by auth SDK (e.g., "Auth0")'),
        observabilitySdk: z
          .string()
          .optional()
          .describe(
            'Filter by observability SDK (e.g., "OpenTelemetry", "Datadog")',
          ),
        realtimeSdk: z
          .string()
          .optional()
          .describe('Filter by realtime SDK (e.g., "Socket.IO", "Pusher")'),
        autoUpdateSdk: z
          .string()
          .optional()
          .describe(
            'Filter by auto-update SDK (e.g., "Sparkle", "electron-updater")',
          ),
        runtime: z
          .string()
          .optional()
          .describe(
            'Filter by runtime (e.g., "electron", "native", "qt", "flutter")',
          ),
        platform: z
          .enum(['macos', 'windows'])
          .optional()
          .describe('Filter by platform'),
        developer: z
          .string()
          .optional()
          .describe('Filter by developer name (partial match)'),
        limit: z
          .number()
          .min(1)
          .max(500)
          .optional()
          .describe('Max results (default 50, max 500)'),
        offset: z
          .number()
          .min(0)
          .optional()
          .describe('Pagination offset (default 0)'),
    },
    {
      title: 'Search apps by technology',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    async (args) => {
      try {
        const { limit: _limit, offset: _offset, ...filterFields } = args;
        const hasFilter = Object.values(filterFields).some(
          (v) => v !== undefined,
        );

        if (!hasFilter) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'At least one filter is required. Specify an SDK category, runtime, platform, or developer. Use list_sdk_categories to see available filters.',
              },
            ],
          };
        }

        const response = await client.search(args);
        const { data: apps, meta } = response;

        if (apps.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `No apps found matching the given filters. Try broadening your search.`,
              },
            ],
          };
        }

        const header = `Found ${meta.totalCount} apps (showing ${meta.resultCount}, offset ${meta.offset})`;

        const appLines = apps.map((app) => {
          const parts: string[] = [
            `- **${app.name}** (${app.platform}) — ${app.developer ?? 'Unknown developer'}`,
          ];

          const runtimeInfo = app.runtime ?? 'native';
          const electronSuffix = app.electronVersion
            ? ` (Electron ${app.electronVersion})`
            : '';
          parts.push(`  Runtime: ${runtimeInfo}${electronSuffix}`);

          if (app.sdkSummary) {
            const activeSDKs = Object.entries(app.sdkSummary)
              .filter(([, v]) => v !== null)
              .map(([, v]) => v);
            if (activeSDKs.length > 0) {
              parts.push(`  SDKs: ${activeSDKs.join(', ')}`);
            }
          }

          return parts.join('\n');
        });

        let text = `${header}\n\n${appLines.join('\n\n')}`;

        if (meta.totalCount > meta.offset + meta.resultCount) {
          text += `\n\nMore results available. Use offset=${meta.offset + meta.resultCount} to see the next page.`;
        }

        return {
          content: [{ type: 'text' as const, text }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
