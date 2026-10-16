# TidyUps Cleaning (`app.tidyupscleaning.com`) — Complete System Workflows

This directory is packaged inside every **Whole Project & Workflows ZIP** uploaded to the **`TidyUps Cleaning App Backup Zips`** folder in Google Drive.

---

## Workflow 1: 1-Click Whole Project & Workflows Backup to Google Drive
- **Target Google Drive Folder**: `TidyUps Cleaning App Backup Zips`
- **How It Works**:
  1. Clicking **"1-Click Upload Whole Project ZIP to Google Drive"** checks if the complete project archive (`TidyUps-Cleaning-Whole-Project-With-Workflows.zip`) is already created on the server (`data/backups/`).
  2. If not yet created (or when refreshed), `/api/project/export-zip` packages the entire repository including `src/`, `server.ts`, `data/`, `api/`, `prompt_templates/`, `.github/workflows/`, `workflows/`, `AI_BUILD_WORKFLOW.md`, and `README.md`.
  3. The app checks Google Drive for a folder named **`TidyUps Cleaning App Backup Zips`**. If the folder does not exist yet, it automatically creates it.
  4. The complete project ZIP and any other exports/downloads from this app are uploaded directly into **`TidyUps Cleaning App Backup Zips`** in Google Drive without downloading files to the local computer.

---

## Workflow 2: Voice Dictation Intake → Quick Quote → Jobber & Dispatch Sync
- **View**: `src/components/QuickQuoteView.tsx`
- **Steps**:
  1. Speak caller details via Web Speech API or paste call transcript.
  2. `POST /api/dispatch/parse-voice-ticket` extracts Customer Name, Phone, Email, Address, Bedrooms, Bathrooms, Recommended Hours, Crew Size, and Notes.
  3. Interactive Edmonton Quick Map calculates driving distance & ETA from each cleaner's Van Hub.
  4. 1-Click sync creates the Jobber Quote (`POST /api/database/quotes`) and scheduled booking (`POST /api/public/book`).

---

## Workflow 3: Full-Year 2026 Jobber Calendar & Live Dispatch Sync
- **View**: `src/components/ScheduledJobsView.tsx` & `src/services/jobberSyncModules.ts`
- **Steps**:
  1. Connects to live Jobber GraphQL API (`https://api.getjobber.com/api/graphql`) using OAuth 2.0 tokens stored in `data/tidyups_cleaning_store.json`.
  2. Syncs all 2026 scheduled visits starting **January 1, 2026** through December 31, 2026 (including all 62 scheduled visits in October 2026).
  3. Converts all UTC timestamps to `America/Edmonton` local time so calendar days and dispatch boards match Jobber 1:1.

---

## Workflow 4: Quo (OpenPhone) 5-Line Call Log & Twilio Spam Shield
- **View**: `src/components/QuoModal.tsx` & `src/components/SpamShieldView.tsx`
- **Steps**:
  1. Monitors 5 regional business lines (Edmonton, St. Albert, Sherwood Park, Spruce Grove, Leduc).
  2. Blocks telemarketers and area-code spam at the Twilio webhook level (`/api/twilio/voice/incoming`).
