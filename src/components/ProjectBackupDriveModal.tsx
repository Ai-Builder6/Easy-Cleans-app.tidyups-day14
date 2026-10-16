import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  CloudUpload,
  CheckCircle2,
  FileArchive,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  RefreshCw,
  GitBranch,
  Globe,
  AlertTriangle,
  Sparkles,
  LogOut,
  FolderOpen,
  Layers,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, getAccessToken, logout } from '../lib/firebase';
import {
  TIDYUPS_DRIVE_FOLDER_NAME,
  DriveFolderInfo,
  DriveBackupFileItem,
  listTidyUpsFolderFiles,
  uploadWholeProjectZipToDriveFolder,
} from '../services/googleDriveBackupService';

interface ProjectBackupDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectBackupDriveModal: React.FC<ProjectBackupDriveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'BACKUP_DRIVE' | 'AI_WORKFLOW' | 'GITHUB_PUBLISH'>('BACKUP_DRIVE');

  // Google Workspace Auth State per workspace-integration skill guidelines
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Server ZIP readiness & Google Drive folder state
  const [zipReadyOnServer, setZipReadyOnServer] = useState<boolean>(false);
  const [zipSizeBytes, setZipSizeBytes] = useState<number>(0);
  const [zipCreatedAt, setZipCreatedAt] = useState<string | null>(null);
  const [driveFolder, setDriveFolder] = useState<DriveFolderInfo | null>(null);

  // Upload & Drive files state
  const [isUploadingDrive, setIsUploadingDrive] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveBackupFileItem[]>([]);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
    link?: string;
    folderLink?: string;
  } | null>(null);

  // Mandatory Explicit User Confirmation Dialog State for Destructive/Mutating Drive Operations
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // AI Build Workflow & README content
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [aiWorkflowContent, setAiWorkflowContent] = useState<string>('');
  const [copiedWorkflow, setCopiedWorkflow] = useState<boolean>(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState<boolean>(false);

  // Initialize Auth Listener
  useEffect(() => {
    const unsub = initAuth(
      (authedUser, cachedToken) => {
        setUser(authedUser);
        setToken(cachedToken);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  // Load README, AI_BUILD_WORKFLOW & server ZIP readiness when opened
  const refreshMetadata = useCallback(() => {
    fetch('/api/project/export-metadata')
      .then((r) => r.json())
      .then((data) => {
        if (data?.readme) setReadmeContent(data.readme);
        if (data?.aiWorkflow) setAiWorkflowContent(data.aiWorkflow);
        setZipReadyOnServer(Boolean(data?.zipReadyOnServer));
        setZipSizeBytes(Number(data?.zipSizeBytes || 0));
        setZipCreatedAt(data?.zipCreatedAt || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refreshMetadata();
  }, [isOpen, refreshMetadata]);

  // Fetch existing backup files from the dedicated "TidyUps Cleaning App Backup Zips" folder in Google Drive
  const fetchDriveBackupFiles = useCallback(async (accessToken?: string | null) => {
    const activeToken = accessToken || (await getAccessToken());
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }

    setIsLoadingFiles(true);
    try {
      const { folder, files } = await listTidyUpsFolderFiles(activeToken);
      setDriveFolder(folder);
      setDriveFiles(files);
    } catch (err: any) {
      if (err?.message === 'AUTH_EXPIRED') {
        setNeedsAuth(true);
      } else {
        console.warn('Google Drive folder list note:', err);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && token && !needsAuth) {
      fetchDriveBackupFiles(token);
    }
  }, [isOpen, token, needsAuth, fetchDriveBackupFiles]);

  // Sign in with Google to authorize Google Drive access
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setStatusBanner(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        setStatusBanner({
          type: 'success',
          message: `Signed in as ${result.user.email || result.user.displayName}. Folder "${TIDYUPS_DRIVE_FOLDER_NAME}" is ready in Google Drive!`,
        });
        fetchDriveBackupFiles(result.accessToken);
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Google Sign-In was cancelled or blocked by popup settings.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setToken(null);
    setUser(null);
    setNeedsAuth(true);
    setDriveFiles([]);
    setDriveFolder(null);
  };

  // 1-Click: Create Whole Project & Workflows ZIP (or reuse if already created) and upload directly into
  // the "TidyUps Cleaning App Backup Zips" folder in Google Drive (NO local computer download!)
  const handleOneClickUploadToDriveFolder = async (forceRebuild = false) => {
    setIsUploadingDrive(true);
    setStatusBanner(null);
    try {
      const result = await uploadWholeProjectZipToDriveFolder({
        forceRebuild,
        accessToken: token,
        aiWorkflowContent,
      });

      const currentToken = await getAccessToken();
      if (currentToken) {
        setToken(currentToken);
        setNeedsAuth(false);
      }
      setDriveFolder(result.folder);
      refreshMetadata();

      setStatusBanner({
        type: 'success',
        message: `✓ ${
          result.reusedServerZip
            ? 'Used already-created Whole Project & Workflows ZIP and uploaded'
            : 'Created Whole Project & Workflows ZIP and uploaded'
        } "${result.file.name}" directly into folder "${result.folder.name}" in Google Drive (no computer download)!`,
        link: result.file.webViewLink || result.folder.webViewLink,
        folderLink: result.folder.webViewLink,
      });

      if (currentToken) {
        fetchDriveBackupFiles(currentToken);
      }
    } catch (err: any) {
      if (err?.message === 'AUTH_EXPIRED') {
        setNeedsAuth(true);
      }
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Failed to upload Whole Project ZIP to Google Drive folder.',
      });
    } finally {
      setIsUploadingDrive(false);
    }
  };

  // Delete a backup file from Google Drive (Requires explicit user confirmation modal per SKILL.md)
  const handleRequestDeleteDriveFile = (file: DriveBackupFileItem) => {
    setConfirmDialog({
      title: `Delete "${file.name}" from "${TIDYUPS_DRIVE_FOLDER_NAME}"?`,
      message: `Are you sure you want to permanently delete "${file.name}" from your "${TIDYUPS_DRIVE_FOLDER_NAME}" folder in Google Drive? This action cannot be undone.`,
      confirmLabel: 'Delete from Google Drive',
      onConfirm: async () => {
        const activeToken = token || (await getAccessToken());
        if (!activeToken) {
          setNeedsAuth(true);
          return;
        }
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (res.ok || res.status === 204) {
          setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
          setStatusBanner({
            type: 'success',
            message: `Deleted "${file.name}" from "${TIDYUPS_DRIVE_FOLDER_NAME}" in Google Drive.`,
          });
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl bg-[#11141f] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 font-sans my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-[#151926] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Whole Project &amp; Workflows ZIP — 1-Click Google Drive Backup
              </h2>
              <p className="text-xs text-slate-400">
                Creates (or reuses) the complete project &amp; workflows archive and uploads directly into{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  📁 {TIDYUPS_DRIVE_FOLDER_NAME}
                </span>{' '}
                on Google Drive — never downloads to your computer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-[#151926] border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('BACKUP_DRIVE')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'BACKUP_DRIVE'
                ? 'border-emerald-500 text-white bg-[#11141f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudUpload className="w-4 h-4 text-emerald-400" />
            <span>1. 1-Click Whole Project ZIP → Google Drive Folder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AI_WORKFLOW')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'AI_WORKFLOW'
                ? 'border-purple-500 text-white bg-[#11141f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>2. Included Workflows &amp; AI Rebuild Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GITHUB_PUBLISH')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'GITHUB_PUBLISH'
                ? 'border-pink-500 text-white bg-[#11141f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-pink-400" />
            <span>3. GitHub Push &amp; When to Publish Live</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {statusBanner && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-700 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{statusBanner.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {statusBanner.folderLink && (
                  <a
                    href={statusBanner.folderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open Drive Folder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'BACKUP_DRIVE' && (
            <div className="space-y-6">
              {/* Primary 1-Click Whole Project & Workflows ZIP -> Google Drive Folder Card */}
              <div className="bg-gradient-to-br from-[#132622] via-[#171b29] to-[#171b29] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                        Whole Project + Workflows • Cloud-Only (No Computer Download)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                        📁 Folder: {TIDYUPS_DRIVE_FOLDER_NAME}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      1-Click Create &amp; Upload Whole Project ZIP to Google Drive
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Packages the entire project — <code className="text-emerald-300">src/</code>,{' '}
                      <code className="text-emerald-300">server.ts</code>,{' '}
                      <code className="text-emerald-300">.github/workflows/</code>,{' '}
                      <code className="text-emerald-300">workflows/COMPLETE_APP_WORKFLOWS.md</code>,{' '}
                      <code className="text-emerald-300">AI_BUILD_WORKFLOW.md</code>,{' '}
                      <code className="text-emerald-300">README.md</code>, and live store — and uploads it directly into{' '}
                      <strong className="text-emerald-300">{TIDYUPS_DRIVE_FOLDER_NAME}</strong> in your Google Drive.
                    </p>
                  </div>

                  {driveFolder?.webViewLink && (
                    <a
                      href={driveFolder.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 shrink-0 self-start md:self-auto"
                    >
                      <FolderOpen className="w-4 h-4 text-emerald-400" />
                      <span>Open Backup Folder in Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Server Archive Status + Included Workflows Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#11141f] border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Whole Project ZIP Status on Server
                      </span>
                      <span className="text-xs font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                        <FileArchive className="w-4 h-4 text-emerald-400 shrink-0" />
                        {zipReadyOnServer
                          ? `Already Created (${(zipSizeBytes / 1024).toFixed(0)} KB) — Ready for Instant Drive Upload`
                          : 'Will Create Whole Project + Workflows ZIP on Click'}
                      </span>
                      {zipCreatedAt && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Last packaged: {new Date(zipCreatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#11141f] border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Google Drive Destination Folder
                      </span>
                      <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5 mt-0.5 font-mono">
                        <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        {TIDYUPS_DRIVE_FOLDER_NAME}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Auto-created if missing • All app exports go into this folder
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Area */}
                <div className="pt-1 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isUploadingDrive || isLoggingIn}
                      onClick={() => handleOneClickUploadToDriveFolder(false)}
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl cursor-pointer disabled:opacity-50 transition-all active:scale-99"
                    >
                      <CloudUpload className="w-5 h-5 shrink-0" />
                      <span>
                        {isUploadingDrive
                          ? `Uploading Whole Project & Workflows ZIP to "${TIDYUPS_DRIVE_FOLDER_NAME}"...`
                          : zipReadyOnServer
                          ? `1-Click Upload Whole Project & Workflows ZIP to "${TIDYUPS_DRIVE_FOLDER_NAME}"`
                          : `1-Click Create & Upload Whole Project + Workflows ZIP to "${TIDYUPS_DRIVE_FOLDER_NAME}"`}
                      </span>
                    </button>

                    {zipReadyOnServer && (
                      <button
                        type="button"
                        disabled={isUploadingDrive || isLoggingIn}
                        onClick={() => handleOneClickUploadToDriveFolder(true)}
                        className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                        title="Rebuild a fresh Whole Project + Workflows ZIP from current files and upload to Google Drive folder"
                      >
                        <RefreshCw className={`w-4 h-4 text-emerald-400 ${isUploadingDrive ? 'animate-spin' : ''}`} />
                        <span>Rebuild Fresh &amp; Upload to Drive</span>
                      </button>
                    )}
                  </div>

                  {/* Google Account Connection Status */}
                  {needsAuth || !token ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <span className="text-xs text-slate-400">
                        Clicking the 1-Click button above will automatically connect Google Drive and upload to{' '}
                        <strong className="text-slate-200">{TIDYUPS_DRIVE_FOLDER_NAME}</strong>, or sign in below:
                      </span>
                      <button
                        type="button"
                        disabled={isLoggingIn}
                        onClick={handleGoogleLogin}
                        className="gsi-material-button py-2 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                      >
                        <div className="gsi-material-button-state" />
                        <div className="gsi-material-button-content-wrapper flex items-center justify-center gap-2">
                          <div className="gsi-material-button-icon w-4 h-4">
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              style={{ display: 'block', width: '16px', height: '16px' }}
                            >
                              <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                              />
                              <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                              />
                              <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                              />
                              <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                          </div>
                          <span className="gsi-material-button-contents">
                            {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 px-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Connected to Google Drive ({user?.email || 'Active Session'}) • Folder:{' '}
                        <strong className="text-emerald-300 font-mono">{TIDYUPS_DRIVE_FOLDER_NAME}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleGoogleLogout}
                        className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Files Inside "TidyUps Cleaning App Backup Zips" Folder in Google Drive */}
              <div className="bg-[#171b29] border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-white">
                        Files Inside Google Drive Folder: <span className="text-emerald-300 font-mono">{TIDYUPS_DRIVE_FOLDER_NAME}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        All Whole Project ZIPs, Workflows, and CSV exports from this app are saved in this folder.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driveFolder?.webViewLink && (
                      <a
                        href={driveFolder.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
                      >
                        <span>Open Folder</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {!needsAuth && token && (
                      <button
                        type="button"
                        onClick={() => fetchDriveBackupFiles(token)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    )}
                  </div>
                </div>

                {needsAuth || !token ? (
                  <p className="text-xs text-slate-400 py-3">
                    Click the <strong>1-Click Upload Whole Project &amp; Workflows ZIP</strong> button above to automatically create the{' '}
                    <code className="text-emerald-300">{TIDYUPS_DRIVE_FOLDER_NAME}</code> folder and upload your project archive.
                  </p>
                ) : driveFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">
                    Folder <strong className="text-emerald-300">{TIDYUPS_DRIVE_FOLDER_NAME}</strong> is ready in your Google Drive. Click the 1-Click button above to upload your Whole Project &amp; Workflows ZIP into it now.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {driveFiles.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 rounded-2xl bg-[#10131d] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {f.createdTime ? new Date(f.createdTime).toLocaleString() : 'Saved in Drive Folder'}
                            {f.size ? ` • ${(Number(f.size) / 1024).toFixed(0)} KB` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {f.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 hover:bg-emerald-600/30"
                            >
                              <span>Open in Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRequestDeleteDriveFile(f)}
                            className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 cursor-pointer"
                            title="Delete file from Google Drive folder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'AI_WORKFLOW' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#171b29] p-4 rounded-2xl border border-purple-500/30">
                <div>
                  <h3 className="text-sm font-black text-white">
                    Complete Project Workflows (<code className="text-purple-300">AI_BUILD_WORKFLOW.md</code> &amp; <code className="text-purple-300">workflows/COMPLETE_APP_WORKFLOWS.md</code>)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Packaged inside every Whole Project ZIP uploaded to <code className="text-emerald-300">{TIDYUPS_DRIVE_FOLDER_NAME}</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(aiWorkflowContent || readmeContent);
                    setCopiedWorkflow(true);
                    setTimeout(() => setCopiedWorkflow(false), 2500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedWorkflow ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWorkflow ? 'Copied All Workflows!' : 'Copy Complete Workflows'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0b0d14] border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[380px] leading-relaxed">
                {aiWorkflowContent || 'Loading complete project workflows...'}
              </pre>
            </div>
          )}

          {activeTab === 'GITHUB_PUBLISH' && (
            <div className="space-y-5">
              {/* Section 1: When to Publish to Make Live on app.tidyupscleaning.com */}
              <div className="bg-[#171b29] border border-emerald-500/40 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <Globe className="w-5 h-5" />
                  <span>When Do You Need to Click &ldquo;Publish&rdquo; to Make Things Live on app.tidyupscleaning.com?</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-white">1. To push code or UI updates live to <code className="text-emerald-300">app.tidyupscleaning.com</code>:</strong>
                    <br />
                    Click the <strong>&ldquo;Publish&rdquo;</strong> (or <strong>&ldquo;Deploy&rdquo;</strong>) button in the top-right corner of Google AI Studio. That builds the production container and updates <code className="text-emerald-300">app.tidyupscleaning.com</code> within ~60 seconds.
                  </p>
                  <p>
                    <strong className="text-white">2. Do you need to re-publish every time someone calls or books a cleaning?</strong>
                    <br />
                    <strong className="text-emerald-400">No!</strong> All daily voice dictations, quick quotes, customer bookings, and Jobber syncs save automatically to your live database.
                  </p>
                </div>
              </div>

              {/* Section 2: Pushing to GitHub */}
              <div className="bg-[#171b29] border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white font-black text-sm">
                    <GitBranch className="w-5 h-5 text-pink-400" />
                    <span>Push Complete Project &amp; Workflows to GitHub</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cmds = `git init\ngit add .\ngit commit -m "TidyUps Cleaning: Whole Project & Workflows Backup"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/tidyups-cleaning.git\ngit push -u origin main`;
                      navigator.clipboard.writeText(cmds);
                      setCopiedGitCmd(true);
                      setTimeout(() => setCopiedGitCmd(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedGitCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGitCmd ? 'Copied Git Commands!' : 'Copy Git Push Commands'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-[#0b0d14] border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`git init
git add .
git commit -m "TidyUps Cleaning: Whole Project & Workflows Backup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tidyups-cleaning.git
git push -u origin main`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Explicit User Confirmation Modal for Destructive Google Drive Actions */}
        {confirmDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#181c2a] border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black text-white">{confirmDialog.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{confirmDialog.message}</p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const fn = confirmDialog.onConfirm;
                    setConfirmDialog(null);
                    await fn();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer"
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
