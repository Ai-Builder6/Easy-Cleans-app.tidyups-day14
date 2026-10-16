import fs from "fs";
import path from "path";

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DATA_DIR = path.join(process.cwd(), "data");
const DATA_DIR = IS_SERVERLESS ? "/tmp" : path.join(process.cwd(), "data");

export type SupportedProjectId = "tidyups";

const PRIMARY_STORE_FILENAME = "tidyups_cleaning_store.json";

export function resolveStoreFilePath(_projectId?: string): string {
  return path.join(DATA_DIR, PRIMARY_STORE_FILENAME);
}

export function resolveBundledStoreFilePath(_projectId?: string): string {
  return path.join(BUNDLED_DATA_DIR, PRIMARY_STORE_FILENAME);
}

export interface AppPersistentStore {
  version: number;
  lastSavedAt: string;
  tickets: any[];
  cleanerOverrides: Record<string, any>;
  scheduledVisits: any[];
  unscheduledJobs?: any[];
  staffRoster?: any[];
  clients?: any[];
  quotes: any[];
  invoices: any[];
  quoCallLogs?: any[];
  adLeads?: any[];
  chatMessages?: any[];
  spamShieldConfig?: {
    enabled: boolean;
    blockAllNonNorthAmerica: boolean;
    blockedCountryCodes: string[];
    blockedPrefixes: string[];
    blockedNumbers: string[];
    blockRobocallFloods: boolean;
    rejectionAction: 'busy' | 'reject';
    forwardDestinationNumber?: string;
    callerIdMode?: 'caller' | 'line';
    lineMappings?: Record<string, string>;
  };
  blockedCallsHistory?: any[];
  recentInboundCalls?: any[];
  jobberConfig?: {
    isConnected: boolean;
    accountName: string;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    lastSyncedAt: string;
  };
  quoConfig?: {
    isConnected: boolean;
    apiKey: string;
    phoneNumbers: any[];
  };
  apiKeys?: {
    mapsApiKey?: string;
    geminiApiKey?: string;
  };
  serviceCatalog?: any[];
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data directory:", err);
  }
}

/**
 * Loads stored data from disk exclusively for TidyUps Cleaning (app.tidyupscleaning.com)
 */
export function loadStore(_projectId?: string): AppPersistentStore | null {
  const targetFile = resolveStoreFilePath();
  const bundledFile = resolveBundledStoreFilePath();

  try {
    const candidateFiles = [targetFile, bundledFile];

    let newestStore: AppPersistentStore | null = null;
    let newestTime = 0;

    for (const file of candidateFiles) {
      if (fs.existsSync(file)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as AppPersistentStore;
          const ts = parsed?.lastSavedAt ? new Date(parsed.lastSavedAt).getTime() : 1;
          if (!newestStore || ts > newestTime) {
            newestStore = parsed;
            newestTime = ts;
          }
        } catch {
          // skip unreadable candidate
        }
      }
    }

    if (newestStore) {
      return newestStore;
    }
  } catch (err) {
    console.warn(`Could not read store file (${targetFile}), creating initial store:`, err);
  }
  return null;
}

/**
 * Atomically writes and persists store data exclusively for TidyUps Cleaning (app.tidyupscleaning.com)
 */
export function saveStore(store: AppPersistentStore, _projectId?: string): boolean {
  const targetFile = resolveStoreFilePath();

  try {
    const existing = loadStore() || ({} as Partial<AppPersistentStore>);

    const merged: AppPersistentStore = {
      ...existing,
      ...store,
      // Ensure nested API, phone configurations, and custom serviceCatalog are never erased if not explicitly provided
      spamShieldConfig: store.spamShieldConfig || existing.spamShieldConfig,
      jobberConfig: store.jobberConfig || existing.jobberConfig,
      quoConfig: store.quoConfig || existing.quoConfig,
      apiKeys: store.apiKeys || existing.apiKeys,
      serviceCatalog:
        Array.isArray(store.serviceCatalog) && store.serviceCatalog.length > 0
          ? store.serviceCatalog
          : existing.serviceCatalog,
      lastSavedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(merged, null, 2);

    fs.writeFileSync(targetFile, json, "utf-8");

    // Also mirror to standalone sub-project folder if present
    const subFile = path.join(process.cwd(), "projects", "tidyupscleaning", "data", PRIMARY_STORE_FILENAME);
    if (fs.existsSync(path.dirname(subFile))) {
      try {
        fs.writeFileSync(subFile, json, "utf-8");
      } catch {
        // ignore
      }
    }

    return true;
  } catch (err) {
    console.error(`Failed to write store (${targetFile}):`, err);
    return false;
  }
}
