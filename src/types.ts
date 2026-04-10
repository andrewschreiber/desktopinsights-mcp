// --- Lookup response types ---

export interface LookupAppResult {
  app: {
    name: string;
    bundleId: string | null;
    slug: string;
    developer: string | null;
    developerWebsite: string | null;
    platform: string;
    currentVersion: string | null;
    runtime: string | null;
    electronVersion: string | null;
    chromiumVersion: string | null;
    nodeVersion: string | null;
    dependencyCount: number | null;
    appSizeBytes: number | null;
    architectures: string[] | null;
    minOsVersion: string | null;
    localizations: string[] | null;
    extractedAt: string | null;
    signed: boolean | null;
    notarized: boolean | null;
    installerType: string | null;
    bundledLibraryCount: number | null;
  };
  sdkSummary: SdkSummary | null;
  technologies: Technology[];
}

export interface LookupResponse {
  data: LookupAppResult[];
  meta: {
    requestId: string;
    resultCount: number;
    query: string;
    platform: string;
  };
}

// --- Search response types ---

export interface SearchAppResult {
  name: string;
  slug: string;
  platform: string;
  developer: string | null;
  developerWebsite: string | null;
  iconUrl: string | null;
  runtime: string | null;
  currentVersion: string | null;
  electronVersion: string | null;
  appSizeBytes: number | null;
  architectures: string[] | null;
  dependencyCount: number | null;
  sdkSummary: SdkSummary | null;
  extractedAt: string | null;
}

export interface SearchResponse {
  data: SearchAppResult[];
  meta: {
    requestId: string;
    resultCount: number;
    totalCount: number;
    limit: number;
    offset: number;
    filters: Record<string, string | null>;
  };
}

// --- Shared types ---

export interface SdkSummary {
  errorTrackingSdk: string | null;
  analyticsSdk: string | null;
  featureFlagSdk: string | null;
  databaseSdk: string | null;
  uiFramework: string | null;
  stateManagement: string | null;
  paymentsSdk: string | null;
  authSdk: string | null;
  observabilitySdk: string | null;
  realtimeSdk: string | null;
  autoUpdateSdk: string | null;
}

export interface Technology {
  name: string;
  version: string | null;
  category: string;
  confidence: number;
}

export interface SearchFilters {
  errorTrackingSdk?: string;
  analyticsSdk?: string;
  featureFlagSdk?: string;
  databaseSdk?: string;
  uiFramework?: string;
  stateManagement?: string;
  paymentsSdk?: string;
  authSdk?: string;
  observabilitySdk?: string;
  realtimeSdk?: string;
  autoUpdateSdk?: string;
  runtime?: string;
  platform?: string;
  developer?: string;
  limit?: number;
  offset?: number;
}

export interface ApiErrorBody {
  error?: string;
  message?: string;
}

// --- SDK category reference data ---

export const SDK_CATEGORIES = [
  {
    field: 'errorTrackingSdk',
    name: 'Error Tracking',
    examples: [
      'Sentry',
      'Bugsnag',
      'Crashpad',
      'Datadog',
      'Rollbar',
      'Raygun',
      'Firebase Crashlytics',
    ],
  },
  {
    field: 'analyticsSdk',
    name: 'Analytics',
    examples: [
      'Mixpanel',
      'Amplitude',
      'Segment',
      'PostHog',
      'Firebase Analytics',
      'Heap',
      'Countly',
      'Aptabase',
    ],
  },
  {
    field: 'featureFlagSdk',
    name: 'Feature Flags',
    examples: ['LaunchDarkly', 'Statsig', 'Unleash', 'GrowthBook', 'Flagsmith'],
  },
  {
    field: 'databaseSdk',
    name: 'Database',
    examples: [
      'electron-store',
      'SQLite',
      'Realm',
      'LevelDB',
      'PouchDB',
      'Core Data',
    ],
  },
  {
    field: 'uiFramework',
    name: 'UI Framework',
    examples: ['React', 'Vue', 'Angular', 'Svelte', 'SwiftUI', 'AppKit', 'Qt'],
  },
  {
    field: 'stateManagement',
    name: 'State Management',
    examples: ['Redux', 'MobX', 'Zustand', 'Jotai', 'Recoil', 'XState'],
  },
  {
    field: 'paymentsSdk',
    name: 'Payments',
    examples: ['Stripe', 'Paddle', 'Braintree', 'RevenueCat'],
  },
  {
    field: 'authSdk',
    name: 'Authentication',
    examples: ['Auth0', 'Firebase Auth', 'Passport.js'],
  },
  {
    field: 'observabilitySdk',
    name: 'Observability',
    examples: ['OpenTelemetry', 'New Relic', 'Pino', 'Winston', 'electron-log'],
  },
  {
    field: 'realtimeSdk',
    name: 'Realtime',
    examples: ['Socket.IO', 'Pusher', 'Ably', 'WebRTC'],
  },
  {
    field: 'autoUpdateSdk',
    name: 'Auto Update',
    examples: ['electron-updater', 'Sparkle', 'Squirrel'],
  },
] as const;

export const SDK_FIELD_NAMES = SDK_CATEGORIES.map((c) => c.field);
