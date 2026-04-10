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

function formatComparison(a: LookupAppResult, b: LookupAppResult): string {
  const lines: string[] = [
    `## ${a.app.name} vs ${b.app.name}`,
    '',
    '### Overview',
    `| | ${a.app.name} | ${b.app.name} |`,
    `|---|---|---|`,
    `| Platform | ${a.app.platform} | ${b.app.platform} |`,
    `| Developer | ${a.app.developer ?? '—'} | ${b.app.developer ?? '—'} |`,
    `| Runtime | ${a.app.runtime ?? 'native'} | ${b.app.runtime ?? 'native'} |`,
    `| Version | ${a.app.currentVersion ?? '—'} | ${b.app.currentVersion ?? '—'} |`,
  ];

  if (a.app.electronVersion || b.app.electronVersion) {
    lines.push(
      `| Electron | ${a.app.electronVersion ?? '—'} | ${b.app.electronVersion ?? '—'} |`,
    );
  }

  const fmtSize = (bytes: number | null) =>
    bytes ? `${(bytes / 1_048_576).toFixed(1)} MB` : '—';
  lines.push(
    `| Size | ${fmtSize(a.app.appSizeBytes)} | ${fmtSize(b.app.appSizeBytes)} |`,
  );
  lines.push(
    `| Dependencies | ${a.app.dependencyCount ?? '—'} | ${b.app.dependencyCount ?? '—'} |`,
  );

  // SDK comparison
  const aSdk = a.sdkSummary ?? ({} as Partial<SdkSummary>);
  const bSdk = b.sdkSummary ?? ({} as Partial<SdkSummary>);

  lines.push('', '### SDK Comparison');
  lines.push(`| Category | ${a.app.name} | ${b.app.name} |`);
  lines.push(`|---|---|---|`);

  for (const [key, displayName] of Object.entries(SDK_DISPLAY_NAMES)) {
    const aVal = (aSdk as Record<string, string | null>)[key] ?? '—';
    const bVal = (bSdk as Record<string, string | null>)[key] ?? '—';
    const marker = aVal !== bVal ? ' *' : '';
    lines.push(`| ${displayName}${marker} | ${aVal} | ${bVal} |`);
  }

  lines.push('', '_* = different between apps_');

  // Unique technologies
  const aTechNames = new Set(a.technologies.map((t) => t.name));
  const bTechNames = new Set(b.technologies.map((t) => t.name));

  const shared = [...aTechNames].filter((n) => bTechNames.has(n));
  const onlyA = [...aTechNames].filter((n) => !bTechNames.has(n));
  const onlyB = [...bTechNames].filter((n) => !aTechNames.has(n));

  if (shared.length > 0) {
    lines.push('', `### Shared Technologies (${shared.length})`);
    lines.push(shared.join(', '));
  }

  if (onlyA.length > 0) {
    lines.push('', `### Only in ${a.app.name} (${onlyA.length})`);
    lines.push(onlyA.join(', '));
  }

  if (onlyB.length > 0) {
    lines.push('', `### Only in ${b.app.name} (${onlyB.length})`);
    lines.push(onlyB.join(', '));
  }

  return lines.join('\n');
}

export function registerCompareTools(
  server: McpServer,
  client: DesktopInsightsClient,
) {
  server.tool(
    'compare_apps',
    'Compare the technology stacks of two desktop applications side by side. ' +
      'Shows SDK differences, shared technologies, and metadata comparison. ' +
      'Useful for competitive analysis (e.g., "Compare Figma vs Sketch", "Compare Slack vs Discord"). ' +
      'Uses 2 API calls.',
    {
      app1: z.string().describe('First app name or bundle ID'),
      app2: z.string().describe('Second app name or bundle ID'),
      platform: z
        .enum(['macos', 'windows'])
        .optional()
        .describe(
          'Platform to compare on (recommended when apps exist on both)',
        ),
    },
    async ({ app1, app2, platform }) => {
      try {
        const [result1, result2] = await Promise.all([
          client.lookup(app1, platform),
          client.lookup(app2, platform),
        ]);

        if (result1.data.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `App not found: "${app1}"`,
              },
            ],
          };
        }

        if (result2.data.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `App not found: "${app2}"`,
              },
            ],
          };
        }

        const text = formatComparison(result1.data[0]!, result2.data[0]!);

        return {
          content: [{ type: 'text' as const, text }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
