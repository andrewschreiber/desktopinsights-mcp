export interface Config {
  apiKey: string;
  apiUrl: string;
}

export function loadConfig(): Config {
  const apiKey = process.env.DESKTOPINSIGHTS_API_KEY;

  if (!apiKey) {
    console.error(
      'Error: DESKTOPINSIGHTS_API_KEY environment variable is required.\n' +
        'Get your API key at https://desktopinsights.com/settings/api',
    );
    process.exit(1);
  }

  return {
    apiKey,
    apiUrl: (
      process.env.DESKTOPINSIGHTS_API_URL ?? 'https://desktopinsights.com'
    ).replace(/\/$/, ''),
  };
}
