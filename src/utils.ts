import { DesktopInsightsApiError } from './client';

export function formatError(error: unknown) {
  if (error instanceof DesktopInsightsApiError) {
    if (error.status === 429) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Rate limit exceeded. The API allows 200 requests per hour. Please wait before retrying.',
          },
        ],
        isError: true as const,
      };
    }

    if (error.status === 401) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Authentication failed. Check that DESKTOPINSIGHTS_API_KEY is valid.',
          },
        ],
        isError: true as const,
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `API error: ${error.message}`,
        },
      ],
      isError: true as const,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true as const,
  };
}
