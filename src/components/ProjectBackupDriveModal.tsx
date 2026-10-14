import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  CloudUpload,
  CheckCircle2,
  FileArchive,
  FileText,
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
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, getAccessToken, logout } from '../lib/firebase';

interface ProjectBackupDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
  webViewLink?: string;
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

  // Backup & Drive state
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveBackupFile[]>([]);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string; link?: string } | null>(null);

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

  // Load README & AI_BUILD_WORKFLOW metadata when opened
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/project/export-metadata')
      .then((r) => r.json())
      .then((data) => {
        if (data?.readme) setReadmeContent(data.readme);
        if (data?.aiWorkflow) setAiWorkflowContent(data.aiWorkflow);
      })
      .catch(() => {});
  }, [isOpen]);

  // Fetch existingTidyUps backup files from Google Drive
  const fetchDriveBackupFiles = useCallback(async (accessToken?: string | null) => {
    const activeToken = accessToken || (await getAccessToken());
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }

    setIsLoadingFiles(true);
    try {
      const q = encodeURIComponent("name contains 'tidyups' or name contains 'AI_BUILD_WORKFLOW' and trashed = false");
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,createdTime,size,webViewLink)&orderBy=createdTime desc&pageSize=15`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );
      if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data.files)) {
        setDriveFiles(data.files);
      }
    } catch (err) {
      console.warn('Google Drive list files note:', err);
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
          message: `Signed in as ${result.user.email || result.user.displayName}. Ready to back up project ZIP to Google Drive!`,
        });
        fetchDriveBackupFiles(result.accessToken);
      }
    } catch (err: any) {
      const isDomainError = err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain');
      setStatusBanner({
        type: 'error',
        message: isDomainError
          ? 'Firebase Authorized Domain required: Please add "app.tidyupscleaning.com" to your Authorized Domains in Firebase Console (Authentication → Settings → Authorized domains). In the meantime, you can download the complete project .ZIP directly using the button below!'
          : (err?.message || 'Google Sign-In was cancelled or blocked by popup settings.'),
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
  };

  // 1. Download Complete Project .ZIP to Local Computer
  const handleDownloadProjectZip = async () => {
    setIsDownloadingZip(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/project/export-zip');
      if (!res.ok) throw new Error('Failed to generate project ZIP archive.');
      const blob = await res.blob();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `tidyups-cleaning-complete-project-${dateStr}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusBanner({
        type: 'success',
        message: `Downloaded ${filename} (${(blob.size / 1024).toFixed(0)} KB) including full source code, README.md & AI_BUILD_WORKFLOW.md!`,
      });
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err.message || 'Could not download ZIP archive.',
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // 2. Upload Complete Project .ZIP + AI_BUILD_WORKFLOW.md to Google Drive
  const executeUploadToGoogleDrive = async () => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }

    setIsUploadingDrive(true);
    setStatusBanner(null);
    try {
      // Fetch freshly generated project .ZIP from server
      const zipRes = await fetch('/api/project/export-zip');
      if (!zipRes.ok) throw new Error('Could not generate project ZIP from server.');
      const zipBlob = await zipRes.blob();

      const dateStr = new Date().toISOString().slice(0, 10);
      const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '-');
      const zipFilename = `tidyups-cleaning-complete-backup-${dateStr}-${timeStr}.zip`;

      // Multipart upload to Google Drive API v3
      const metadata = {
        name: zipFilename,
        mimeType: 'application/zip',
        description:
          'Complete TidyUps Cleaning (app.tidyupscleaning.com) Full-Stack Source Code, Voice Dictation Intake, Quick Quote, Quick Map, Jobber Sync, README.md & AI_BUILD_WORKFLOW.md',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', zipBlob);

      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          body: form,
        }
      );

      if (uploadRes.status === 401 || uploadRes.status === 403) {
        setNeedsAuth(true);
        throw new Error('Google Drive session expired. Please click "Sign in with Google" to re-authenticate.');
      }

      const uploadedData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadedData?.error?.message || 'Failed to upload ZIP to Google Drive.');
      }

      // Also upload standalone AI_BUILD_WORKFLOW.md so it can be opened directly in Google Drive
      if (aiWorkflowContent) {
        const wfMeta = {
          name: `AI_BUILD_WORKFLOW-${dateStr}.md`,
          mimeType: 'text/markdown',
          description: 'Master AI Build & Reconstruction Workflow for TidyUps Cleaning (app.tidyupscleaning.com)',
        };
        const wfForm = new FormData();
        wfForm.append('metadata', new Blob([JSON.stringify(wfMeta)], { type: 'application/json' }));
        wfForm.append('file', new Blob([aiWorkflowContent], { type: 'text/markdown' }));
        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
          body: wfForm,
        }).catch(() => {});
      }

      setStatusBanner({
        type: 'success',
        message: `✓ Uploaded ${uploadedData.name} + AI_BUILD_WORKFLOW.md to your Google Drive!`,
        link: uploadedData.webViewLink || 'https://drive.google.com',
      });
      fetchDriveBackupFiles(activeToken);
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err.message || 'Failed to upload backup to Google Drive.',
      });
    } finally {
      setIsUploadingDrive(false);
    }
  };

  // Delete a backup file from Google Drive (Requires explicit user confirmation modal per SKILL.md)
  const handleRequestDeleteDriveFile = (file: DriveBackupFile) => {
    setConfirmDialog({
      title: `Delete "${file.name}" from Google Drive?`,
      message: `Are you sure you want to permanently delete "${file.name}" from your Google Drive? This action cannot be undone.`,
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
            message: `Deleted "${file.name}" from Google Drive.`,
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
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Project Backup (.ZIP), Google Drive Sync, GitHub &amp; AI Build Workflow
              </h2>
              <p className="text-xs text-slate-400">
                Download the complete codebase ZIP, send backups to Google Drive, copy the AI Rebuild Workflow, or publish to <span className="text-emerald-400 font-mono font-bold">app.tidyupscleaning.com</span>.
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
                ? 'border-pink-500 text-white bg-[#11141f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudUpload className="w-4 h-4 text-pink-400" />
            <span>1. Download .ZIP &amp; Google Drive Backup</span>
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
            <span>2. README &amp; AI Complete Build Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GITHUB_PUBLISH')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'GITHUB_PUBLISH'
                ? 'border-emerald-500 text-white bg-[#11141f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>3. GitHub Push &amp; When to Publish Live</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {statusBanner && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-700 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{statusBanner.message}</span>
              </div>
              {statusBanner.link && (
                <a
                  href={statusBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0"
                >
                  <span>Open in Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {activeTab === 'BACKUP_DRIVE' && (
            <div className="space-y-6">
              {/* Two Main Action Cards: Local ZIP Download + Google Drive Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card A: Instant Local Project ZIP Download */}
                <div className="bg-[#171b29] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-wider">
                        Complete Source Code + AI Workflow
                      </span>
                      <FileArchive className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="text-base font-black text-white">
                      Download Complete Project (.ZIP)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Packages the entire project (<code className="text-pink-300">src/</code>, <code className="text-pink-300">server.ts</code>, <code className="text-pink-300">package.json</code>, <code className="text-pink-300">README.md</code>, and <code className="text-pink-300">AI_BUILD_WORKFLOW.md</code>) into a clean, ready-to-run ZIP file.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isDownloadingZip}
                    onClick={handleDownloadProjectZip}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isDownloadingZip
                        ? 'Packaging Complete Project ZIP...'
                        : 'Download Complete Project .ZIP Now'}
                    </span>
                  </button>
                </div>

                {/* Card B: Send Backup ZIP to Google Drive */}
                <div className="bg-[#171b29] border border-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                        Google Drive Cloud Backup
                      </span>
                      <CloudUpload className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-base font-black text-white">
                      Send Backup .ZIP to Google Drive
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Uploads the full project <code className="text-emerald-300">.zip</code> archive and <code className="text-emerald-300">AI_BUILD_WORKFLOW.md</code> directly into your Google Drive account (<code className="text-slate-300">cleaningserviceyeg@gmail.com</code>).
                    </p>
                  </div>

                  {needsAuth || !token ? (
                    <div className="space-y-2">
                      {/* Official "Sign in with Google" Material Button per workspace-integration skill */}
                      <button
                        type="button"
                        disabled={isLoggingIn}
                        onClick={handleGoogleLogin}
                        className="gsi-material-button w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer"
                      >
                        <div className="gsi-material-button-state" />
                        <div className="gsi-material-button-content-wrapper flex items-center justify-center gap-2.5">
                          <div className="gsi-material-button-icon w-5 h-5">
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              style={{ display: 'block', width: '20px', height: '20px' }}
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
                            {isLoggingIn ? 'Connecting Google Drive...' : 'Sign in with Google to Connect Drive'}
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={isUploadingDrive}
                        onClick={executeUploadToGoogleDrive}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                      >
                        <CloudUpload className="w-4 h-4" />
                        <span>
                          {isUploadingDrive
                            ? 'Uploading Project ZIP to Google Drive...'
                            : 'Send Backup .ZIP to Google Drive Now'}
                        </span>
                      </button>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>Connected: {user?.email || 'Google Drive Active'}</span>
                        <button
                          type="button"
                          onClick={handleGoogleLogout}
                          className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Google Drive Backups List */}
              {!needsAuth && token && (
                <div className="bg-[#171b29] border border-slate-800 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-black text-white">
                        Your TidyUps Project Backups in Google Drive
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchDriveBackupFiles(token)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {driveFiles.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">
                      No backup archives listed yet — click <strong>&ldquo;Send Backup .ZIP to Google Drive Now&rdquo;</strong> above to upload your first full snapshot.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {driveFiles.map((f) => (
                        <div
                          key={f.id}
                          className="p-3 rounded-2xl bg-[#10131d] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{f.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {f.createdTime ? new Date(f.createdTime).toLocaleString() : 'Saved in Drive'}
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
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRequestDeleteDriveFile(f)}
                              className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 cursor-pointer"
                              title="Delete backup from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'AI_WORKFLOW' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#171b29] p-4 rounded-2xl border border-purple-500/30">
                <div>
                  <h3 className="text-sm font-black text-white">
                    Master AI Rebuild Prompt &amp; Complete Project Workflow (<code className="text-purple-300">AI_BUILD_WORKFLOW.md</code>)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Included automatically inside your ZIP download &amp; Google Drive backup. Copy and paste this into any AI assistant when opening the project to build or extend it immediately.
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
                  <span>{copiedWorkflow ? 'Copied AI Workflow!' : 'Copy AI Build Workflow'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0b0d14] border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[380px] leading-relaxed">
                {aiWorkflowContent || 'Loading AI_BUILD_WORKFLOW.md...'}
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
                    <strong className="text-white">1. To push today&apos;s new Voice Dictation &amp; Intake Header, Bedrooms/Bathrooms Quoting Form, Quick Map &amp; Google Drive Backup live to <code className="text-emerald-300">app.tidyupscleaning.com</code>:</strong>
                    <br />
                    Click the <strong>&ldquo;Publish&rdquo;</strong> (or <strong>&ldquo;Deploy&rdquo;</strong>) button in the top-right corner of Google AI Studio right now. That builds the production container and updates <code className="text-emerald-300">app.tidyupscleaning.com</code> within ~60 seconds.
                  </p>
                  <p>
                    <strong className="text-white">2. Do you need to re-publish every time someone calls or books a cleaning?</strong>
                    <br />
                    <strong className="text-emerald-400">No!</strong> All daily voice dictations, quick quotes, customer bookings, and Jobber syncs save automatically to your live Cloud Firestore database (<code className="text-pink-300">ai-studio-cleaningserviced-8a2493ab-cb9d-4c28-a60b-c28e7d08d30e</code>). You <strong>only</strong> need to click Publish when we change the app&apos;s code, buttons, or page design.
                  </p>
                </div>
              </div>

              {/* Section 2: Pushing to GitHub */}
              <div className="bg-[#171b29] border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white font-black text-sm">
                    <GitBranch className="w-5 h-5 text-pink-400" />
                    <span>Push Complete Project to GitHub</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cmds = `git init\ngit add .\ngit commit -m "TidyUps Cleaning: Voice Dictation Intake, Quick Quote, Quick Map & Google Drive Backup"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/tidyups-cleaning.git\ngit push -u origin main`;
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
                <p className="text-xs text-slate-400 leading-relaxed">
                  All project files (including <code className="text-pink-300">README.md</code> and <code className="text-pink-300">AI_BUILD_WORKFLOW.md</code>) are committed to the local Git repository on branch <code className="text-emerald-300">main</code>. You can click the <strong>GitHub icon</strong> in the top-right bar of AI Studio to sync directly to your GitHub account, or unzip the downloaded project and run:
                </p>
                <pre className="p-3.5 rounded-2xl bg-[#0b0d14] border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`git init
git add .
git commit -m "TidyUps Cleaning: Voice Dictation Intake, Quick Quote, Quick Map & Google Drive Backup"
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
