import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Check,
  X,
  Plus,
  Calculator,
  Copy,
  CheckCircle2,
  ExternalLink,
  ClipboardPaste,
  ShieldAlert,
  FileSpreadsheet,
  Download,
  Trash2,
  UserPlus,
  FileCheck,
  Layers,
  BedDouble,
  Bath,
  Send,
  Key,
} from 'lucide-react';
import { AdLeadItem, LeadStatus, LeadVerdict } from '../types/lead';
import { JobberQuote, extractJobberNumericId } from '../services/jobberSyncModules';
import { QuoteDetailModal } from './QuoteDetailModal';

export type CleanSheetTab =
  | 'ALL'
  | 'Facebook Leads'
  | 'Google Leads'
  | 'Voice & Quick Quotes'
  | 'Pasted Leads';

interface LeadsViewProps {
  leads: AdLeadItem[];
  onLeadsUpdated?: (leads: AdLeadItem[]) => void;
  onConvertLeadToJob?: (lead: AdLeadItem) => void;
  onOpenQuickQuote?: (lead?: AdLeadItem) => void;
  onOpenSpamShield?: (preFillNumber?: string) => void;
  calls?: any[];
  visits?: any[];
  clients?: any[];
  quotes?: JobberQuote[];
  onQuotesUpdated?: (quotes: JobberQuote[]) => void;
  onClientsUpdated?: (clients: any[]) => void;
  onOpenJobberModal?: () => void;
  projectId?: 'dispatchgeeni' | 'tidyups';
}

interface ParsedPasteLead {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  bedrooms: string;
  bathrooms: string;
  serviceRequested: string;
  quotedAmount: number;
  notes: string;
}

function parseRawPasteIntoLeads(rawText: string): ParsedPasteLead[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const results: ParsedPasteLead[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip obvious header row
    if (
      i === 0 &&
      /^(date|name|client|customer|first\s*name|source|sheet\s*tab)\b/i.test(line) &&
      (line.includes('\t') || line.includes(',') || line.includes('|'))
    ) {
      continue;
    }

    const delimiter = line.includes('\t')
      ? '\t'
      : line.includes('|')
      ? '|'
      : line.split(',').length >= 3
      ? ','
      : null;

    if (delimiter) {
      const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
      // Detect phone column
      const phoneIdx = cols.findIndex((c) => /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(c));
      const emailIdx = cols.findIndex((c) => /\S+@\S+\.\S+/.test(c));
      const priceIdx = cols.findIndex((c) => /^\$?\d{2,4}(\.\d{2})?$/.test(c));
      const bedIdx = cols.findIndex((c) => /\d+\s*(?:bed|bd|br)/i.test(c));
      const bathIdx = cols.findIndex((c) => /\d+(?:\.\d+)?\s*(?:bath|ba)/i.test(c));
      const addrIdx = cols.findIndex(
        (c, idx) =>
          idx !== phoneIdx &&
          idx !== emailIdx &&
          (/\d+\s+[A-Za-z0-9]+\s+(?:st|street|ave|avenue|rd|road|dr|drive|blvd|way|pl|place|cres|nw|sw|ne|se)\b/i.test(
            c
          ) ||
            /edmonton|st\.?\s*albert|sherwood\s*park|spruce\s*grove|leduc|beaumont/i.test(c))
      );

      const usedIndices = new Set(
        [phoneIdx, emailIdx, priceIdx, bedIdx, bathIdx, addrIdx].filter((idx) => idx >= 0)
      );
      const nameCandidate =
        cols.find(
          (c, idx) =>
            !usedIndices.has(idx) &&
            c.length >= 2 &&
            !/^\d{4}-\d{2}-\d{2}/.test(c) &&
            !/^(facebook|google|voice|pasted|new|good lead)/i.test(c)
        ) ||
        cols[0] ||
        'Clean Sheet Lead';

      const phone = phoneIdx >= 0 ? cols[phoneIdx] : '';
      const email = emailIdx >= 0 ? cols[emailIdx] : '';
      const address = addrIdx >= 0 ? cols[addrIdx] : cols[2] || 'Edmonton, AB';
      const bedrooms = bedIdx >= 0 ? cols[bedIdx] : '3 Bedrooms';
      const bathrooms = bathIdx >= 0 ? cols[bathIdx] : '2 Bathrooms';
      const quotedAmount =
        priceIdx >= 0 ? parseFloat(cols[priceIdx].replace(/[^0-9.]/g, '')) || 221.07 : 221.07;

      const remainingNotes = cols
        .filter((_, idx) => !usedIndices.has(idx) && cols[idx] !== nameCandidate)
        .join(' | ');

      results.push({
        customerName: nameCandidate,
        phone,
        email,
        address,
        city: 'Edmonton',
        postalCode: '',
        bedrooms,
        bathrooms,
        serviceRequested:
          remainingNotes.match(/(?:move[- ]?out|deep\s*clean|basic|standard|airbnb|post[- ]?construction)[^|]*/i)?.[0] ||
          '3Bed 2Bath Basic Initial Cleaning (1 Pro Cleaner)',
        quotedAmount,
        notes: remainingNotes,
      });
    } else {
      // Free-form text line
      const phoneMatch = line.match(/(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const priceMatch = line.match(/\$\s*(\d{2,4}(?:\.\d{2})?)/);
      const bedMatch = line.match(/(\d+)\s*(?:bed|bedroom|bd|br)/i);
      const bathMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:bath|bathroom|ba)/i);
      const addrMatch = line.match(
        /(\d{2,5}\s+[A-Za-z0-9\s]{2,25}(?:st|street|ave|avenue|rd|road|dr|drive|blvd|way|nw|sw|ne|se)\b)/i
      );
      const nameClean = line
        .replace(phoneMatch?.[0] || '', '')
        .replace(emailMatch?.[0] || '', '')
        .replace(addrMatch?.[0] || '', '')
        .split(/[-–—,|]/)[0]
        .trim();

      results.push({
        customerName: nameClean && nameClean.length >= 2 ? nameClean.slice(0, 45) : 'New Lead',
        phone: phoneMatch ? phoneMatch[1].trim() : '',
        email: emailMatch ? emailMatch[1].trim() : '',
        address: addrMatch ? addrMatch[1].trim() : 'Edmonton, AB',
        city: 'Edmonton',
        postalCode: '',
        bedrooms: bedMatch ? `${bedMatch[1]} Bedrooms` : '3 Bedrooms',
        bathrooms: bathMatch ? `${bathMatch[1]} Bathrooms` : '2 Bathrooms',
        serviceRequested: /move[- ]?out/i.test(line)
          ? 'Move-Out Cleaning'
          : /deep/i.test(line)
          ? 'Deep Cleaning'
          : '3Bed 2Bath Basic Initial Cleaning (1 Pro Cleaner)',
        quotedAmount: priceMatch ? parseFloat(priceMatch[1]) : 221.07,
        notes: line,
      });
    }
  }

  return results;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads: initialLeads,
  onLeadsUpdated,
  onOpenQuickQuote,
  onOpenSpamShield,
  quotes = [],
  onQuotesUpdated,
  onClientsUpdated,
  onOpenJobberModal,
  projectId = 'tidyups',
}) => {
  const [leadsList, setLeadsList] = useState<AdLeadItem[]>(initialLeads || []);
  const [activeTab, setActiveTab] = useState<CleanSheetTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | LeadVerdict>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingRowId, setSyncingRowId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<JobberQuote | null>(null);

  // Paste Table & Quick Row Entry State
  const [targetSheetTab, setTargetSheetTab] = useState<Exclude<CleanSheetTab, 'ALL'>>('Facebook Leads');
  const [pasteText, setPasteText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(true);

  // Quick 1-Line Manual Add Row state
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickAddress, setQuickAddress] = useState('');
  const [quickBedrooms, setQuickBedrooms] = useState('3 Bedrooms');
  const [quickBathrooms, setQuickBathrooms] = useState('2 Bathrooms');
  const [quickService, setQuickService] = useState('3Bed 2Bath Basic Initial Cleaning (1 Pro Cleaner)');
  const [quickPrice, setQuickPrice] = useState('221.07');
  const [quickNotes, setQuickNotes] = useState('');

  // Custom Google Sheet URL state
  const [googleSheetUrl, setGoogleSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1TifULi7n2BylQdvla_clean_sheet/edit'
  );
  const [isSavingSheetUrl, setIsSavingSheetUrl] = useState(false);

  useEffect(() => {
    setLeadsList(initialLeads || []);
  }, [initialLeads]);

  useEffect(() => {
    fetch(`/api/google-sheets/status?project=${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.sheetUrl) setGoogleSheetUrl(d.sheetUrl);
      })
      .catch(() => {});
  }, [projectId]);

  const parsedPreviewRows = useMemo(() => parseRawPasteIntoLeads(pasteText), [pasteText]);

  const tabCounts = useMemo(() => {
    const counts: Record<CleanSheetTab, number> = {
      ALL: leadsList.length,
      'Facebook Leads': 0,
      'Google Leads': 0,
      'Voice & Quick Quotes': 0,
      'Pasted Leads': 0,
    };
    for (const l of leadsList) {
      const st = (l as any).sourceTab as CleanSheetTab;
      if (st && counts[st] !== undefined) {
        counts[st]++;
      } else if (String(l.source).includes('Facebook')) {
        counts['Facebook Leads']++;
      } else if (String(l.source).includes('Google')) {
        counts['Google Leads']++;
      } else if (String(l.source).includes('Paste')) {
        counts['Pasted Leads']++;
      } else {
        counts['Voice & Quick Quotes']++;
      }
    }
    return counts;
  }, [leadsList]);

  const filteredLeads = useMemo(() => {
    return leadsList.filter((l) => {
      const rowTab =
        (l as any).sourceTab ||
        (String(l.source).includes('Facebook')
          ? 'Facebook Leads'
          : String(l.source).includes('Google')
          ? 'Google Leads'
          : String(l.source).includes('Paste')
          ? 'Pasted Leads'
          : 'Voice & Quick Quotes');

      if (activeTab !== 'ALL' && rowTab !== activeTab) return false;
      if (verdictFilter !== 'ALL' && (l.verdict || 'Good lead') !== verdictFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          l.customerName?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.address?.toLowerCase().includes(q) ||
          l.serviceRequested?.toLowerCase().includes(q) ||
          l.quoteNumber?.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [leadsList, activeTab, verdictFilter, searchQuery]);

  // Save connected blank Google Sheet URL
  const handleSaveSheetUrl = async () => {
    setIsSavingSheetUrl(true);
    try {
      const res = await fetch(`/api/google-sheets/config?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ sheetUrl: googleSheetUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice('✓ Connected your Clean Google Sheet URL! All new Facebook, Google, Voice & Pasted leads sync here.');
      }
    } catch (e: any) {
      setNotice(`Could not save Sheet URL: ${e.message}`);
    } finally {
      setIsSavingSheetUrl(false);
    }
  };

  // Add Pasted Rows (and optionally run Step 1: Create Client in Jobber -> Step 2: Create Request or Quote in Jobber)
  const handleImportPastedRows = async (syncToJobber: boolean, createRequestOnly: boolean = false) => {
    if (parsedPreviewRows.length === 0) return;
    setIsSyncing(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/leads?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({
          leads: parsedPreviewRows,
          sourceTab: targetSheetTab,
          syncToJobber,
          createRequestOnly,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeadsList(data.leads);
        if (onLeadsUpdated) onLeadsUpdated(data.leads);
        if (data.quotes && onQuotesUpdated) onQuotesUpdated(data.quotes);
        if (data.clients && onClientsUpdated) onClientsUpdated(data.clients);
        setPasteText('');
        setNotice(data.message || `✓ Added ${parsedPreviewRows.length} lead(s) to ${targetSheetTab}!`);
      } else {
        setNotice(data.error || 'Failed to add pasted leads.');
      }
    } catch (err: any) {
      setNotice(`Error importing rows: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add Quick Single Lead Row (and optionally run Step 1: Create Client in Jobber -> Step 2: Create Request or Quote in Jobber)
  const handleAddQuickSingleRow = async (syncToJobber: boolean, createRequestOnly: boolean = false) => {
    if (!quickName.trim() && !quickPhone.trim()) {
      setNotice('Please enter at least a Client Name or Phone Number.');
      return;
    }
    setIsSyncing(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/leads?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({
          customerName: quickName.trim() || 'New Clean Sheet Client',
          phone: quickPhone.trim(),
          address: quickAddress.trim() || 'Edmonton, AB',
          city: 'Edmonton',
          bedrooms: quickBedrooms,
          bathrooms: quickBathrooms,
          serviceRequested: quickService,
          quotedAmount: parseFloat(quickPrice) || 221.07,
          notes: quickNotes.trim(),
          sourceTab: targetSheetTab,
          syncToJobber,
          createRequestOnly,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeadsList(data.leads);
        if (onLeadsUpdated) onLeadsUpdated(data.leads);
        if (data.quotes && onQuotesUpdated) onQuotesUpdated(data.quotes);
        if (data.clients && onClientsUpdated) onClientsUpdated(data.clients);
        setQuickName('');
        setQuickPhone('');
        setQuickAddress('');
        setQuickNotes('');
        setNotice(data.message || `✓ Added row to ${targetSheetTab}!`);
      }
    } catch (err: any) {
      setNotice(`Error adding row: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1-Click Sync Row to Jobber: Step 1 (Create Client & Property in Jobber) -> Step 2 (Create Request or Quote in Jobber)
  const handleSyncRowToJobber = async (lead: AdLeadItem, createRequestOnly: boolean = false) => {
    setSyncingRowId(lead.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}/sync-jobber?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ createRequestOnly }),
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.leads)) {
          setLeadsList(data.leads);
          if (onLeadsUpdated) onLeadsUpdated(data.leads);
        }
        if (Array.isArray(data.quotes) && onQuotesUpdated) {
          onQuotesUpdated(data.quotes);
        }
        if (Array.isArray(data.clients) && onClientsUpdated) {
          onClientsUpdated(data.clients);
        }
        setNotice(
          data.message ||
            `✓ Step 1: Created Client "${lead.customerName}" in Jobber → Step 2: Created ${
              createRequestOnly ? 'Request' : `Quote ${data.quote?.quoteNumber || ''}`
            } in Jobber!`
        );
      } else {
        setNotice(data.error || 'Could not sync row to Jobber.');
      }
    } catch (err: any) {
      setNotice(`Jobber sync error: ${err.message}`);
    } finally {
      setSyncingRowId(null);
    }
  };

  // Reset Clean Sheet to Blank (or keep only live Jobber-synced quotes like Rahum #4293)
  const handleClearCleanSheet = async (keepSyncedQuotes: boolean) => {
    setIsSyncing(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/leads/clear-sheet?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ keepSyncedQuotes }),
      });
      const data = await res.json();
      if (data.success) {
        setLeadsList(data.leads || []);
        if (onLeadsUpdated) onLeadsUpdated(data.leads || []);
        setNotice(data.message);
      }
    } catch (err: any) {
      setNotice(`Error resetting sheet: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Copy Clean Sheet Table as TSV to paste into any blank Google Sheet
  const handleCopySheetAsTsv = () => {
    const headers = [
      'Date',
      'Sheet Tab',
      'Source',
      'Client Name',
      'Phone',
      'Email',
      'Street Address',
      'City',
      'Postal Code',
      'Bedrooms',
      'Bathrooms',
      'Service Requested',
      'Quoted Total ($)',
      'Jobber Quote #',
      'Jobber Quote Link',
      'Verdict',
      'Status',
      'Notes',
    ];
    const rows = filteredLeads.map((l) => {
      const numericQuoteId = extractJobberNumericId(l.quoteId);
      const quoteLink = numericQuoteId
        ? `https://secure.getjobber.com/quotes/${numericQuoteId}`
        : 'https://secure.getjobber.com/quotes';
      return [
        (l.dateReceived || new Date().toISOString()).slice(0, 10),
        (l as any).sourceTab || 'Voice & Quick Quotes',
        l.source || 'Voice / Quick Quote',
        l.customerName || '',
        l.phone || '',
        l.email || '',
        l.address || '',
        l.city || 'Edmonton',
        l.postalCode || '',
        l.bedrooms || '3 Bedrooms',
        l.bathrooms || '2 Bathrooms',
        l.serviceRequested || '',
        l.quotedAmount !== undefined ? Number(l.quotedAmount).toFixed(2) : '',
        l.quoteNumber || '',
        quoteLink,
        l.verdict || 'Good lead',
        l.status || 'New',
        (l.notes || '').replace(/\r?\n/g, ' '),
      ].join('\t');
    });
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
    setNotice('✓ Copied Clean Sheet rows (with headers) to clipboard — press Ctrl+V / Cmd+V in Row 1 of your blank Google Sheet!');
  };

  const handleUpdateVerdict = async (leadId: string, verdict: LeadVerdict) => {
    const updated = leadsList.map((l) => (l.id === leadId ? { ...l, verdict } : l));
    setLeadsList(updated);
    if (onLeadsUpdated) onLeadsUpdated(updated);
    await fetch(`/api/leads/${encodeURIComponent(leadId)}?project=${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
      body: JSON.stringify({ verdict }),
    }).catch(() => {});
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d0f17] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn min-h-[calc(100vh-4rem)]">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Clean Google Sheet Hub — FB Leads, Google Leads, Voice Quotes &amp; Paste Table
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Jobber Order: 1. Create Client → 2. Create Request / Quote
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              A brand-new, clean multi-tab Google Sheets workspace with zero old clutter. Paste Facebook Leads, Google Leads, or create Voice Quotes — and sync any row to Jobber in strict order (Client first, then Request or Quote).
            </p>
          </div>
        </div>

        {/* Top Right Export & Reset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenJobberModal && (
            <button
              type="button"
              onClick={onOpenJobberModal}
              className="px-3.5 py-2 bg-[#1b2234] hover:bg-[#232c42] text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Open Jobber Developer App & OAuth Credentials Hub"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Jobber Credentials &amp; Secret</span>
            </button>
          )}

          <a
            href={`/api/leads/export.xlsx?project=${projectId}`}
            download
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Download Multi-Tab Clean Google Sheet (.xlsx) with Facebook Leads, Google Leads, Voice Quotes & Pasted Leads tabs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Clean Google Sheet (.xlsx)</span>
          </a>

          <a
            href={`/api/leads/export.csv?project=${projectId}&tab=${encodeURIComponent(activeTab)}`}
            download
            className="px-3 py-2 bg-[#1b2234] hover:bg-[#232c42] text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <button
            type="button"
            onClick={handleCopySheetAsTsv}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {copiedTsv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTsv ? 'Copied for Google Sheets!' : 'Copy Clean Table for Google Sheets'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleClearCleanSheet(false)}
            className="px-3 py-2 bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Wipe all rows so your Clean Google Sheet is 100% blank"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset to 100% Blank Sheet</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-300 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Connected Blank Google Sheet URL Bar */}
      <div className="p-4 rounded-2xl bg-[#131724] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-extrabold text-slate-300 whitespace-nowrap">
            Your Clean Google Sheet URL:
          </span>
          <input
            type="text"
            value={googleSheetUrl}
            onChange={(e) => setGoogleSheetUrl(e.target.value)}
            placeholder="Paste your blank Google Sheet link here (https://docs.google.com/spreadsheets/d/...)"
            className="flex-1 px-3 py-1.5 rounded-xl bg-[#0b0e17] border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleSaveSheetUrl}
            disabled={isSavingSheetUrl}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            {isSavingSheetUrl ? 'Saving...' : 'Save Sheet Link'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={googleSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Google Sheet</span>
          </a>
          <button
            type="button"
            onClick={() => setShowPasteBox((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-purple-400" />
            <span>{showPasteBox ? 'Hide Paste Table' : 'Show Paste Table'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          CLEAN GOOGLE SHEET TABS (All / Facebook Leads / Google Leads / Voice & Quick Quotes / Pasted Leads)
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { id: 'ALL', label: 'All Clean Sheet Rows', badgeClass: 'bg-slate-700 text-white' },
              { id: 'Facebook Leads', label: 'Facebook Leads', badgeClass: 'bg-blue-600/30 text-blue-300' },
              { id: 'Google Leads', label: 'Google Leads', badgeClass: 'bg-amber-500/30 text-amber-300' },
              { id: 'Voice & Quick Quotes', label: 'Voice & Quick Quotes', badgeClass: 'bg-pink-600/30 text-pink-300' },
              { id: 'Pasted Leads', label: 'Pasted Leads', badgeClass: 'bg-purple-600/30 text-purple-300' },
            ] as { id: CleanSheetTab; label: string; badgeClass: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'ALL') setTargetSheetTab(tab.id);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-500/30'
                    : 'bg-[#141824] hover:bg-[#1c2233] text-slate-300 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-black/30 text-white' : tab.badgeClass
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Verdict Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, quote #4293..."
              className="pl-8 pr-3 py-2 rounded-xl bg-[#141824] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 w-56"
            />
          </div>
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#141824] border border-slate-800 text-xs text-slate-200 font-bold"
          >
            <option value="ALL">All Verdicts</option>
            <option value="Good lead">Good Lead</option>
            <option value="Spam">Spam</option>
            <option value="Garbage">Garbage</option>
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          PASTE TABLE & QUICK ADD WORKSPACE (For Facebook Leads, Google Leads, Voice & Pasted Leads)
         ───────────────────────────────────────────────────────────────────────────── */}
      {showPasteBox && (
        <div className="bg-gradient-to-br from-[#141928] via-[#131724] to-[#111520] border border-emerald-500/30 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Paste Table or Add New Lead → Clean Google Sheet &amp; Jobber (1. Client → 2. Request / Quote)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste rows from Facebook Ads, Google Local Services, Excel/Sheets, or raw text — or add a single row below. Choose which tab it goes into and sync directly to Jobber.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Send into Sheet Tab:</span>
              <select
                value={targetSheetTab}
                onChange={(e) => setTargetSheetTab(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#0b0e17] border border-emerald-500/50 text-emerald-300 text-xs font-extrabold"
              >
                <option value="Facebook Leads">Facebook Leads</option>
                <option value="Google Leads">Google Leads</option>
                <option value="Voice & Quick Quotes">Voice &amp; Quick Quotes</option>
                <option value="Pasted Leads">Pasted Leads</option>
              </select>
            </div>
          </div>

          {/* Quick Single-Row Add Bar */}
          <div className="p-3.5 rounded-2xl bg-[#0b0e17]/90 border border-slate-800 space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
              Quick Single-Row Entry (into {targetSheetTab})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Client Name (e.g. Rahum)"
                className="px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-white"
              />
              <input
                type="text"
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                placeholder="Phone (e.g. 416-560-1354)"
                className="px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-white"
              />
              <input
                type="text"
                value={quickAddress}
                onChange={(e) => setQuickAddress(e.target.value)}
                placeholder="Street Address, Edmonton"
                className="px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-white lg:col-span-2"
              />
              <select
                value={quickBedrooms}
                onChange={(e) => setQuickBedrooms(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-white"
              >
                <option value="1 Bedroom">1 Bedroom</option>
                <option value="2 Bedrooms">2 Bedrooms</option>
                <option value="3 Bedrooms">3 Bedrooms</option>
                <option value="4 Bedrooms">4 Bedrooms</option>
                <option value="5+ Bedrooms">5+ Bedrooms</option>
              </select>
              <select
                value={quickBathrooms}
                onChange={(e) => setQuickBathrooms(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-white"
              >
                <option value="1 Bathroom">1 Bathroom</option>
                <option value="1.5 Bathrooms">1.5 Bathrooms</option>
                <option value="2 Bathrooms">2 Bathrooms</option>
                <option value="2.5 Bathrooms">2.5 Bathrooms</option>
                <option value="3+ Bathrooms">3+ Bathrooms</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                placeholder="Total $"
                className="px-3 py-2 rounded-xl bg-[#141824] border border-emerald-500/40 text-xs text-emerald-300 font-mono font-bold"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <input
                type="text"
                value={quickService}
                onChange={(e) => setQuickService(e.target.value)}
                placeholder="Service Requested (e.g. 3Bed 2Bath Basic Initial Cleaning)"
                className="flex-1 px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-slate-200"
              />
              <input
                type="text"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="Notes (e.g. inside oven, pets, deposit $50)"
                className="flex-1 px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-slate-200"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => handleAddQuickSingleRow(false, false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add to Sheet Only</span>
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => handleAddQuickSingleRow(true, true)}
                  className="px-3 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Client → 2. Jobber Request + Sheet</span>
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => handleAddQuickSingleRow(true, false)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>1. Client → 2. Jobber Quote + Sheet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Row Paste Table Box */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
              Bulk Paste Table (Paste from Google Sheets, Excel, Facebook Leads CSV, or Google Ads)
            </label>
            <textarea
              rows={3}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Paste 1 or more rows here (Tab, Comma, or Pipe separated):\nSarah Miller\t780-555-0192\t10420 Jasper Ave NW, Edmonton\t3 Bedrooms\t2.5 Bathrooms\tDeep Cleaning\t$285.00`}
              className="w-full p-3 rounded-2xl bg-[#0b0e17] border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {parsedPreviewRows.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0b0e17] border border-emerald-500/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-300">
                  Ready to Import {parsedPreviewRows.length} Pasted Row(s) into [{targetSheetTab}]
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleImportPastedRows(false, false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Add {parsedPreviewRows.length} Row(s) to Clean Sheet Only
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleImportPastedRows(true, true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-extrabold cursor-pointer"
                  >
                    1. Create Client → 2. Create Request in Jobber + Sheet
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleImportPastedRows(true, false)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    1. Create Client → 2. Create Quote in Jobber + Sheet
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-44">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5 px-2">Client Name</th>
                      <th className="py-1.5 px-2">Phone</th>
                      <th className="py-1.5 px-2">Street Address</th>
                      <th className="py-1.5 px-2">Bed / Bath</th>
                      <th className="py-1.5 px-2">Service</th>
                      <th className="py-1.5 px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreviewRows.map((r, i) => (
                      <tr key={i} className="border-b border-slate-800/50 text-slate-200">
                        <td className="py-1.5 px-2 font-bold text-white">{r.customerName}</td>
                        <td className="py-1.5 px-2 font-mono text-emerald-300">{r.phone || '—'}</td>
                        <td className="py-1.5 px-2">{r.address}</td>
                        <td className="py-1.5 px-2">
                          {r.bedrooms} • {r.bathrooms}
                        </td>
                        <td className="py-1.5 px-2">{r.serviceRequested}</td>
                        <td className="py-1.5 px-2 font-mono font-bold text-emerald-400">
                          ${r.quotedAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          CLEAN GOOGLE SHEET LIVE SPREADSHEET TABLE
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#121623] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 bg-[#161b2b] border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-extrabold text-white">
              Clean Google Sheet Rows ({filteredLeads.length})
            </span>
            <span className="text-[11px] text-slate-400">
              • Showing {activeTab === 'ALL' ? 'All Tabs' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {leadsList.length === 0 && (
              <button
                type="button"
                onClick={() => handleClearCleanSheet(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold cursor-pointer"
              >
                Restore Live Jobber Quote #4293 (Rahum)
              </button>
            )}
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-emerald-400/60 mx-auto" />
            <div className="text-base font-extrabold text-white">
              Your Clean Google Sheet ({activeTab === 'ALL' ? 'All Tabs' : activeTab}) is Ready &amp; Blank
            </div>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Use the Quick Single-Row Entry or Paste Table above to add Facebook Leads, Google Leads, or Pasted Leads — or create a Voice Quote in the Voice Dictation tab and it will sync here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0e121d] border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date / Tab</th>
                  <th className="py-3 px-3">Client Name &amp; Phone</th>
                  <th className="py-3 px-3">Service Property Address</th>
                  <th className="py-3 px-3">Bed / Bath &amp; Service</th>
                  <th className="py-3 px-3">Quoted ($)</th>
                  <th className="py-3 px-3">Jobber Status (1. Client → 2. Quote)</th>
                  <th className="py-3 px-3">Verdict</th>
                  <th className="py-3 px-3 text-right">Jobber &amp; Quote Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredLeads.map((lead) => {
                  const rowTab =
                    (lead as any).sourceTab ||
                    (String(lead.source).includes('Facebook')
                      ? 'Facebook Leads'
                      : String(lead.source).includes('Google')
                      ? 'Google Leads'
                      : String(lead.source).includes('Paste')
                      ? 'Pasted Leads'
                      : 'Voice & Quick Quotes');

                  const matchedQuote = quotes.find(
                    (q) =>
                      q.id === lead.quoteId ||
                      (lead.quoteNumber && q.quoteNumber === lead.quoteNumber)
                  );
                  const numericQuoteId =
                    extractJobberNumericId(matchedQuote?.id) ||
                    extractJobberNumericId(lead.quoteId);
                  const realJobberQuoteUrl = numericQuoteId
                    ? `https://secure.getjobber.com/quotes/${numericQuoteId}`
                    : matchedQuote?.jobberWebUri &&
                      !matchedQuote.jobberWebUri.endsWith('/quotes/4331')
                    ? matchedQuote.jobberWebUri
                    : null;

                  const numericClientId = extractJobberNumericId(
                    (lead as any).jobberClientId || matchedQuote?.jobberClientId
                  );
                  const realJobberClientUrl = numericClientId
                    ? `https://secure.getjobber.com/clients/${numericClientId}`
                    : null;

                  const isRowSyncing = syncingRowId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#171d2e]/80 transition-colors"
                    >
                      {/* Date & Sheet Tab */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-300 font-bold">
                          {(lead.dateReceived || '').slice(0, 10) || '2026-10-16'}
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            rowTab === 'Facebook Leads'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : rowTab === 'Google Leads'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : rowTab === 'Pasted Leads'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          }`}
                        >
                          {rowTab}
                        </span>
                      </td>

                      {/* Client Name & Phone */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="font-extrabold text-white text-sm">
                          {lead.customerName}
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300 font-mono text-xs mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{lead.phone || 'No phone'}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Property Address */}
                      <td className="py-3.5 px-3 align-top max-w-[220px]">
                        <div className="flex items-start gap-1.5 text-slate-200 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                          <span>
                            {lead.address || 'Edmonton, AB'}
                            {lead.postalCode ? `, ${lead.postalCode}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Bed / Bath & Service */}
                      <td className="py-3.5 px-3 align-top max-w-[260px]">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 text-[10px] font-bold flex items-center gap-1">
                            <BedDouble className="w-3 h-3" />
                            {lead.bedrooms || '3 Bedrooms'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 text-[10px] font-bold flex items-center gap-1">
                            <Bath className="w-3 h-3" />
                            {lead.bathrooms || '2 Bathrooms'}
                          </span>
                        </div>
                        <div className="font-bold text-slate-100">
                          {lead.serviceRequested || 'Residential Standard Cleaning'}
                        </div>
                        {lead.notes && (
                          <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {lead.notes}
                          </div>
                        )}
                      </td>

                      {/* Quoted Total */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <div className="font-mono font-black text-sm text-emerald-400">
                          ${Number(lead.quotedAmount ?? 221.07).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">CAD + GST</div>
                      </td>

                      {/* Jobber Sync Status */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="space-y-1">
                          {realJobberQuoteUrl ? (
                            <a
                              href={realJobberQuoteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px]"
                              title={`Open Live Jobber Quote ${lead.quoteNumber || ''} (${realJobberQuoteUrl})`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{lead.quoteNumber || 'Jobber Quote'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-bold">
                              Not Yet Pushed to Jobber
                            </span>
                          )}

                          {realJobberClientUrl && (
                            <div>
                              <a
                                href={realJobberClientUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:underline font-bold"
                              >
                                <span>Client #{numericClientId}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Verdict */}
                      <td className="py-3.5 px-3 align-top">
                        <select
                          value={lead.verdict || 'Good lead'}
                          onChange={(e) =>
                            handleUpdateVerdict(lead.id, e.target.value as LeadVerdict)
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-extrabold border ${
                            (lead.verdict || 'Good lead') === 'Good lead'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : lead.verdict === 'Spam'
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          <option value="Good lead">Good lead</option>
                          <option value="Spam">Spam</option>
                          <option value="Garbage">Garbage</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            disabled={isRowSyncing}
                            onClick={() => handleSyncRowToJobber(lead, false)}
                            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                            title="Step 1: Create Client & Property in Jobber -> Step 2: Create Quote in Jobber"
                          >
                            {isRowSyncing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>1. Client → 2. Quote</span>
                          </button>

                          <button
                            type="button"
                            disabled={isRowSyncing}
                            onClick={() => handleSyncRowToJobber(lead, true)}
                            className="px-2.5 py-1.5 rounded-xl bg-cyan-600/25 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Step 1: Create Client & Property in Jobber -> Step 2: Create Request Only in Jobber"
                          >
                            <UserPlus className="w-3 h-3 text-cyan-400" />
                            <span>1. Client → 2. Request</span>
                          </button>

                          {matchedQuote && (
                            <button
                              type="button"
                              onClick={() => setSelectedQuoteForModal(matchedQuote)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-[11px] font-bold cursor-pointer"
                            >
                              View Quote
                            </button>
                          )}

                          {onOpenQuickQuote && (
                            <button
                              type="button"
                              onClick={() => onOpenQuickQuote(lead)}
                              className="px-2.5 py-1.5 rounded-xl bg-pink-600/25 hover:bg-pink-600/40 border border-pink-500/40 text-pink-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Calculator className="w-3 h-3" />
                              <span>Calculator</span>
                            </button>
                          )}

                          {onOpenSpamShield && lead.phone && (
                            <button
                              type="button"
                              onClick={() => onOpenSpamShield(lead.phone)}
                              className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                              title="Block in Twilio Spam Shield"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quote Detail Modal */}
      <QuoteDetailModal
        isOpen={Boolean(selectedQuoteForModal)}
        quote={selectedQuoteForModal}
        onClose={() => setSelectedQuoteForModal(null)}
        projectId={projectId}
      />
    </div>
  );
};
