import type {
  ApiErrorBody,
  LookupResponse,
  SearchFilters,
  SearchResponse,
} from './types';

export class DesktopInsightsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: { apiKey: string; apiUrl: string }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.apiUrl;
  }

  async lookup(
    app: string,
    platform?: 'macos' | 'windows',
  ): Promise<LookupResponse> {
    const params = new URLSearchParams({ app });
    if (platform) params.set('platform', platform);
    return this.request<LookupResponse>(`/api/v1/lookup?${params}`);
  }

  async search(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    return this.request<SearchResponse>(`/api/v1/search?${params}`);
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'User-Agent': 'desktopinsights-mcp/0.1.0',
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}) as ApiErrorBody);
      const err = body as ApiErrorBody;
      throw new DesktopInsightsApiError(
        response.status,
        err.message ?? response.statusText,
        err.error ?? 'Unknown Error',
      );
    }

    return response.json() as Promise<T>;
  }
}

export class DesktopInsightsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
  ) {
    super(`${code} (${status}): ${message}`);
    this.name = 'DesktopInsightsApiError';
  }
}
