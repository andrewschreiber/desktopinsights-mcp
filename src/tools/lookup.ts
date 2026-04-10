import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';

import type { DesktopInsightsClient } from '../client';
import type { LookupAppResult, SdkSummary } from '../types';
import { formatError } from '../utils';

const SDK_DISPLAY_NAMES: Record<keyof SdkSummary, string> = {
  errorTrackingSdk: 'Error Tracking',
  analyticsSdk: 'Analytics',
  featureFlagSdk: 'Feature Flags',
  databaseSdk: 'Database',
  uiFramework: 'UI Framework',
  stateManagement: 'State Management',
  paymentsSdk: 'Payments',
  authSdk: 'Authentication',
  observabilitySdk: 'Observability',
  realtimeSdk: 'Realtime',
  autoUpdateSdk: 'Auto Update',
};

function formatAppResult(result: LookupAppResult): string {
  const { app, sdkSummary, technologies } = result;

  const lines: string[] = [
    `## ${app.name} (${app.platform})`,
    '',
    `Developer: ${app.developer ?? 'Unknown'}`,
    `Version: ${app.currentVersion ?? 'Unknown'}`,
    `Runtime: ${app.runtime ?? 'native'}`,
  ];

  if (app.electronVersion) {
    lines.push(
      `Electron: ${app.electronVersion} (Chromium ${app.chromiumVersion ?? '?'}, Node ${app.nodeVersion ?? '?'})`,
    );
  }

  if (app.appSizeBytes) {
    lines.push(`Size: ${(app.appSizeBytes / 1_048_576).toFixed(1)} MB`);
  }

  if (app.architectures?.length) {
    lines.push(`Architectures: ${app.architectures.join(', ')}`);
  }

  if (app.minOsVersion) {
    lines.push(`Min OS: ${app.minOsVersion}`);
  }

  if (app.signed !== null) {
    lines.push(
      `Code Signing: ${app.signed ? 'Signed' : 'Unsigned'}${app.notarized ? ', Notarized' : ''}`,
    );
  }

  // SDK Summary
  if (sdkSummary) {
    lines.push('', '### SDK Summary');
    for (const [key, displayName] of Object.entries(SDK_DISPLAY_NAMES)) {
      const value = sdkSummary[key as keyof SdkSummary];
      lines.push(`  ${displayName}: ${value ?? '—'}`);
    }
  }

  // Technologies
  if (technologies.length > 0) {
    lines.push('', `### Technologies (${technologies.length})`);
    for (const t of technologies) {
      const version = t.version ? ` v${t.version}` : '';
      lines.push(`  - ${t.name}${version} (${t.category}, ${t.confidence}%)`);
    }
  }

  return lines.join('\n');
}

export function registerLookupTools(
  server: McpServer,
  client: DesktopInsightsClient,
) {
  server.tool(
    'lookup_app',
    'Look up what SDKs, frameworks, and dependencies a specific desktop application uses. ' +
      'Returns the full technology stack including error tracking, analytics, UI framework, payments, and 7 other SDK categories, ' +
      'plus detailed dependency list with versions. ' +
      'Accepts app names (e.g., "Figma", "Slack", "1Password") or bundle IDs (e.g., "com.figma.Desktop"). ' +
      'Covers 12,000+ macOS and Windows apps.',
    {
      app: z
        .string()
        .describe(
          'App name (e.g., "Figma", "Slack") or bundle ID (e.g., "com.figma.Desktop")',
        ),
      platform: z
        .enum(['macos', 'windows'])
        .optional()
        .describe('Filter by platform. Omit to search both.'),
    },
    async ({ app, platform }) => {
      try {
        const response = await client.lookup(app, platform);

        if (response.data.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `No app found matching "${app}".`,
              },
            ],
          };
        }

        const text = response.data.map(formatAppResult).join('\n\n---\n\n');

        return {
          content: [{ type: 'text' as const, text }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
