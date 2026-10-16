import { User } from 'firebase/auth';
import { getAccessToken, googleSignIn } from '../lib/firebase';

export const TIDYUPS_DRIVE_FOLDER_NAME = 'TidyUps Cleaning App Backup Zips';

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DriveBackupFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
  webViewLink?: string;
}

export interface DriveUploadResult {
  folder: DriveFolderInfo;
  file: DriveBackupFileItem;
  reusedServerZip: boolean;
  alreadyInDrive?: boolean;
  userEmail?: string | null;
}

// Cache folder info in memory per session so repeated uploads are instant
let cachedFolderInfo: DriveFolderInfo | null = null;

/**
 * Ensures we have an active Google OAuth access token.
 * If not yet signed in, triggers the Google Sign-In popup directly from the user's click.
 */
export async function ensureDriveAuthToken(): Promise<{ accessToken: string; user?: User | null }> {
  const existingToken = await getAccessToken();
  if (existingToken) {
    return { accessToken: existingToken };
  }
  const signInResult = await googleSignIn();
  if (!signInResult?.accessToken) {
    throw new Error('Google Drive authorization is required to upload to your Drive folder.');
  }
  return {
    accessToken: signInResult.accessToken,
    user: signInResult.user,
  };
}

/**
 * Finds or creates the dedicated "TidyUps Cleaning App Backup Zips" folder in the user's Google Drive.
 */
export async function ensureTidyUpsDriveFolder(accessToken: string): Promise<DriveFolderInfo> {
  if (cachedFolderInfo) {
    // Verify cached folder still exists and is not trashed
    try {
      const checkRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${cachedFolderInfo.id}?fields=id,name,webViewLink,trashed`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData?.id && !checkData.trashed) {
          return {
            id: checkData.id,
            name: checkData.name || TIDYUPS_DRIVE_FOLDER_NAME,
            webViewLink:
              checkData.webViewLink || `https://drive.google.com/drive/folders/${checkData.id}`,
          };
        }
      }
    } catch {
      // Fall through to search/create
    }
    cachedFolderInfo = null;
  }

  // 1. Search for existing "TidyUps Cleaning App Backup Zips" folder
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${TIDYUPS_DRIVE_FOLDER_NAME}' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=5`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.status === 401 || searchRes.status === 403) {
    throw new Error('AUTH_EXPIRED');
  }

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (Array.isArray(searchData.files) && searchData.files.length > 0) {
      const existing = searchData.files[0];
      cachedFolderInfo = {
        id: existing.id,
        name: existing.name || TIDYUPS_DRIVE_FOLDER_NAME,
        webViewLink:
          existing.webViewLink || `https://drive.google.com/drive/folders/${existing.id}`,
      };
      return cachedFolderInfo;
    }
  }

  // 2. Folder doesn't exist yet — create "TidyUps Cleaning App Backup Zips" in Google Drive
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: TIDYUPS_DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description:
          'Dedicated backup folder for TidyUps Cleaning App (app.tidyupscleaning.com) — Whole Project & Workflows ZIPs and App Downloads',
      }),
    }
  );

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `Failed to create "${TIDYUPS_DRIVE_FOLDER_NAME}" folder in Google Drive.`
    );
  }

  const created = await createRes.json();
  cachedFolderInfo = {
    id: created.id,
    name: created.name || TIDYUPS_DRIVE_FOLDER_NAME,
    webViewLink: created.webViewLink || `https://drive.google.com/drive/folders/${created.id}`,
  };
  return cachedFolderInfo;
}

/**
 * Lists all backup ZIPs and app downloads stored inside the "TidyUps Cleaning App Backup Zips" folder.
 */
export async function listTidyUpsFolderFiles(
  accessToken: string
): Promise<{ folder: DriveFolderInfo; files: DriveBackupFileItem[] }> {
  const folder = await ensureTidyUpsDriveFolder(accessToken);
  const q = encodeURIComponent(`'${folder.id}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,createdTime,size,webViewLink)&orderBy=createdTime desc&pageSize=30`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_EXPIRED');
  }

  const data = await res.json().catch(() => ({}));
  return {
    folder,
    files: Array.isArray(data.files) ? data.files : [],
  };
}

/**
 * Uploads any file or export from the app directly into the "TidyUps Cleaning App Backup Zips" Google Drive folder
 * without downloading it to the user's computer.
 */
export async function uploadAppFileToTidyUpsDriveFolder(params: {
  filename: string;
  blob: Blob;
  mimeType: string;
  description?: string;
  accessToken?: string | null;
}): Promise<{ folder: DriveFolderInfo; file: DriveBackupFileItem }> {
  let token = params.accessToken || (await getAccessToken());
  if (!token) {
    const authRes = await ensureDriveAuthToken();
    token = authRes.accessToken;
  }

  let folder: DriveFolderInfo;
  try {
    folder = await ensureTidyUpsDriveFolder(token);
  } catch (err: any) {
    if (err?.message === 'AUTH_EXPIRED') {
      const freshAuth = await googleSignIn();
      if (!freshAuth?.accessToken) throw new Error('Google Drive re-authentication required.');
      token = freshAuth.accessToken;
      folder = await ensureTidyUpsDriveFolder(token);
    } else {
      throw err;
    }
  }

  // Check if a file with the exact same name already exists inside the folder
  const existingQ = encodeURIComponent(
    `'${folder.id}' in parents and name = '${params.filename.replace(/'/g, "\\'")}' and trashed = false`
  );
  const existingRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${existingQ}&fields=files(id,name,webViewLink,size,createdTime)&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const existingData = existingRes.ok ? await existingRes.json().catch(() => ({})) : {};
  const existingFile = Array.isArray(existingData.files) ? existingData.files[0] : null;

  const form = new FormData();
  if (existingFile?.id) {
    // Update existing file in place inside the folder
    const updateMeta = {
      name: params.filename,
      mimeType: params.mimeType,
      description:
        params.description ||
        `Uploaded from TidyUps Cleaning App (app.tidyupscleaning.com) into ${TIDYUPS_DRIVE_FOLDER_NAME}`,
    };
    form.append('metadata', new Blob([JSON.stringify(updateMeta)], { type: 'application/json' }));
    form.append('file', params.blob);

    const patchRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart&fields=id,name,mimeType,createdTime,size,webViewLink`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );
    if (patchRes.ok) {
      const updated = await patchRes.json();
      return { folder, file: updated };
    }
  }

  // Create new file inside "TidyUps Cleaning App Backup Zips" folder
  const createMeta = {
    name: params.filename,
    mimeType: params.mimeType,
    parents: [folder.id],
    description:
      params.description ||
      `Uploaded from TidyUps Cleaning App (app.tidyupscleaning.com) into ${TIDYUPS_DRIVE_FOLDER_NAME}`,
  };
  const createForm = new FormData();
  createForm.append('metadata', new Blob([JSON.stringify(createMeta)], { type: 'application/json' }));
  createForm.append('file', params.blob);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,size,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: createForm,
    }
  );

  if (!uploadRes.ok) {
    const errBody = await uploadRes.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || 'Failed to upload file to Google Drive folder.');
  }

  const uploaded = await uploadRes.json();
  return { folder, file: uploaded };
}

/**
 * 1-Click Handler:
 * 1. Creates the Whole Project & Workflows ZIP on the server (or reuses the already-created one on the server).
 * 2. Ensures the "TidyUps Cleaning App Backup Zips" folder exists in Google Drive.
 * 3. Uploads the Whole Project & Workflows ZIP (plus AI_BUILD_WORKFLOW.md) straight into that folder
 *    WITHOUT downloading anything to the local computer.
 */
export async function uploadWholeProjectZipToDriveFolder(options?: {
  customFilename?: string;
  forceRebuild?: boolean;
  accessToken?: string | null;
  aiWorkflowContent?: string;
}): Promise<DriveUploadResult> {
  let token = options?.accessToken || (await getAccessToken());
  let userEmail: string | null = null;

  if (!token) {
    const authRes = await ensureDriveAuthToken();
    token = authRes.accessToken;
    userEmail = authRes.user?.email || null;
  }

  let folder: DriveFolderInfo;
  try {
    folder = await ensureTidyUpsDriveFolder(token);
  } catch (err: any) {
    if (err?.message === 'AUTH_EXPIRED') {
      const freshAuth = await googleSignIn();
      if (!freshAuth?.accessToken) {
        throw new Error('Google Drive re-authentication required.');
      }
      token = freshAuth.accessToken;
      userEmail = freshAuth.user?.email || null;
      folder = await ensureTidyUpsDriveFolder(token);
    } else {
      throw err;
    }
  }

  // Fetch (or create/reuse) Whole Project & Workflows ZIP from backend without triggering browser download
  const queryUrl = `/api/project/export-zip?mode=drive${options?.forceRebuild ? '&force=true' : ''}`;
  const zipRes = await fetch(queryUrl);
  if (!zipRes.ok) {
    throw new Error('Could not build or retrieve Whole Project & Workflows ZIP from server.');
  }

  const reusedServerZip = zipRes.headers.get('X-Zip-Cache-Status') === 'REUSED_EXISTING';
  const serverSuggestedName = zipRes.headers.get('X-Zip-Filename');
  const zipBlob = await zipRes.blob();

  const dateStr = new Date().toISOString().slice(0, 10);
  const zipFilename =
    options?.customFilename ||
    serverSuggestedName ||
    `TidyUps-Cleaning-Whole-Project-And-Workflows-${dateStr}.zip`;

  const { file } = await uploadAppFileToTidyUpsDriveFolder({
    filename: zipFilename,
    blob: zipBlob,
    mimeType: 'application/zip',
    description:
      'Complete TidyUps Cleaning Project & Workflows Archive (src/, server.ts, .github/workflows/, workflows/, AI_BUILD_WORKFLOW.md, README.md, database store & configs)',
    accessToken: token,
  });

  // Also ensure AI_BUILD_WORKFLOW.md is inside the same "TidyUps Cleaning App Backup Zips" folder
  if (options?.aiWorkflowContent) {
    await uploadAppFileToTidyUpsDriveFolder({
      filename: `AI_BUILD_WORKFLOW-${dateStr}.md`,
      blob: new Blob([options.aiWorkflowContent], { type: 'text/markdown' }),
      mimeType: 'text/markdown',
      description: 'Master AI Build & Reconstruction Workflow for TidyUps Cleaning (app.tidyupscleaning.com)',
      accessToken: token,
    }).catch(() => {});
  }

  return {
    folder,
    file,
    reusedServerZip,
    userEmail,
  };
}
