import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Plus,
  FileSpreadsheet,
  Check,
  ClipboardList,
  Sparkles,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  DollarSign,
  Tag,
  Clock,
  Users,
  ShieldCheck,
  Layers,
  ArrowRight,
  BedDouble,
  Bath,
  CheckCircle2,
  AlertCircle,
  FileText,
  Link2,
  Calculator,
} from 'lucide-react';
import {
  ServiceCatalogItem,
  CANONICAL_SERVICE_CATALOG,
  parsePastedPriceList,
  parseSpreadsheetBuffer,
} from '../data/serviceCatalogData';

interface ServiceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: ServiceCatalogItem[];
  onCatalogUpdated: (newCatalog: ServiceCatalogItem[]) => void;
  onSelectForQuote?: (item: ServiceCatalogItem) => void;
  projectId?: string;
}

export const ServiceCatalogModal: React.FC<ServiceCatalogModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onCatalogUpdated,
  onSelectForQuote,
  projectId = 'tidyups',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importMode, setImportMode] = useState<'REPLACE' | 'APPEND'>('APPEND');
  const [editingItem, setEditingItem] = useState<ServiceCatalogItem | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Attached file state (Excel .xlsx, .xls, .csv, .tsv, Google Sheets export)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeKb: string;
    type: string;
    itemCount: number;
  } | null>(null);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form state for Add/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCatalogItem['category']>('MOVE_OUT');
  const [formServiceType, setFormServiceType] = useState<ServiceCatalogItem['serviceType']>('Move-Out Cleaning');
  const [formBedrooms, setFormBedrooms] = useState('2 Bedrooms');
  const [formBathrooms, setFormBathrooms] = useState('2 Bathrooms');
  const [formQuantity, setFormQuantity] = useState('3.0');
  const [formUnitPrice, setFormUnitPrice] = useState('105.00');
  const [formTotal, setFormTotal] = useState('315.00');
  const [formCleanersCount, setFormCleanersCount] = useState('2');
  const [formDeposit, setFormDeposit] = useState('100.00');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formIsActive, setFormIsActive] = useState(true);

  const currentItems = catalog && catalog.length > 0 ? catalog : CANONICAL_SERVICE_CATALOG;

  // Filtered catalog list
  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.shortName || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.bedrooms || '').toLowerCase().includes(q) ||
        (item.bathrooms || '').toLowerCase().includes(q) ||
        (item.jobberItemName || '').toLowerCase().includes(q) ||
        String(item.unitPrice).includes(q) ||
        String(item.total).includes(q)
      );
    });
  }, [currentItems, selectedCategory, search]);

  // Preview of pasted or attached file text
  const parsedPreview = useMemo(() => {
    if (!pastedText.trim()) return [];
    return parsePastedPriceList(pastedText);
  }, [pastedText]);

  const categories = [
    { id: 'ALL', label: 'All Catalog Items', count: currentItems.length },
    { id: 'MOVE_OUT', label: 'Move-Out Cleaning', count: currentItems.filter((i) => i.category === 'MOVE_OUT').length },
    { id: 'DEEP_CLEAN', label: 'Deep Cleaning', count: currentItems.filter((i) => i.category === 'DEEP_CLEAN').length },
    { id: 'STANDARD_CLEAN', label: 'Initial / Standard', count: currentItems.filter((i) => i.category === 'STANDARD_CLEAN').length },
    { id: 'POST_CONSTRUCTION', label: 'Post-Construction', count: currentItems.filter((i) => i.category === 'POST_CONSTRUCTION').length },
    { id: 'RECURRING', label: 'Bi-Weekly Recurring', count: currentItems.filter((i) => i.category === 'RECURRING').length },
    { id: 'ADD_ON', label: 'Add-on Services', count: currentItems.filter((i) => i.category === 'ADD_ON').length },
    { id: 'HOURLY', label: 'Hourly Rates', count: currentItems.filter((i) => i.category === 'HOURLY').length },
  ];

  // Auto-calculate Total in Add/Edit form whenever Quantity or Unit Price changes
  const handleQuantityChange = (val: string) => {
    setFormQuantity(val);
    const q = parseFloat(val);
    const u = parseFloat(formUnitPrice);
    if (!isNaN(q) && !isNaN(u)) {
      setFormTotal((q * u).toFixed(2));
    }
  };

  const handleUnitPriceChange = (val: string) => {
    setFormUnitPrice(val);
    const q = parseFloat(formQuantity);
    const u = parseFloat(val);
    if (!isNaN(q) && !isNaN(u)) {
      setFormTotal((q * u).toFixed(2));
    }
  };

  // Handle file upload (.xlsx, .xls, .csv, .tsv, .txt)
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const sizeKb = (file.size / 1024).toFixed(1);

      if (isExcel) {
        const arrayBuffer = await file.arrayBuffer();
        const { rawText } = parseSpreadsheetBuffer(arrayBuffer);
        setPastedText(rawText);
        const parsed = parsePastedPriceList(rawText);
        setAttachedFile({
          name: file.name,
          sizeKb,
          type: 'Excel Spreadsheet (.xlsx / .xls)',
          itemCount: parsed.length,
        });
      } else {
        const text = await file.text();
        setPastedText(text);
        const parsed = parsePastedPriceList(text);
        setAttachedFile({
          name: file.name,
          sizeKb,
          type: 'CSV / Spreadsheet Export',
          itemCount: parsed.length,
        });
      }
    } catch (err: any) {
      alert(`Could not parse file: ${err.message || 'Invalid spreadsheet file format'}`);
    }
  };

  // Handle Google Sheets URL import
  const handleFetchGoogleSheets = async () => {
    if (!googleSheetsUrl.trim()) return;
    setIsFetchingSheet(true);
    try {
      // Check for spreadsheet ID in URL
      const match = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        alert('Please paste a valid Google Sheets URL (e.g., https://docs.google.com/spreadsheets/d/YOUR_ID/edit).');
        return;
      }
      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error(`Google Sheets export returned status ${res.status}. Make sure the sheet is shared as "Anyone with the link can view".`);
      }
      const csvText = await res.text();
      setPastedText(csvText);
      const parsed = parsePastedPriceList(csvText);
      setAttachedFile({
        name: `Google Sheets (ID: ${sheetId.slice(0, 8)}...)`,
        sizeKb: `${(csvText.length / 1024).toFixed(1)}`,
        type: 'Google Sheets Live Sync',
        itemCount: parsed.length,
      });
    } catch (err: any) {
      alert(`Google Sheets Import Note: ${err.message}\n\nTip: You can also download the Google Sheet as Excel (.xlsx) or CSV, or copy-paste the cells directly into the box below!`);
    } finally {
      setIsFetchingSheet(false);
    }
  };

  const handleClearAttachedFile = () => {
    setAttachedFile(null);
    setPastedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyPastedPriceList = async () => {
    if (parsedPreview.length === 0) return;
    setIsSaving(true);
    try {
      const nextCatalog =
        importMode === 'REPLACE'
          ? parsedPreview
          : [
              ...currentItems.filter(
                (c) => !parsedPreview.some((p) => p.name.toLowerCase() === c.name.toLowerCase())
              ),
              ...parsedPreview,
            ];

      const res = await fetch(`/api/price-list?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ items: nextCatalog }),
      });
      const data = await res.json();
      if (data.success && data.items) {
        onCatalogUpdated(data.items);
        setFeedbackNotice(`✓ Successfully imported ${parsedPreview.length} price list items! Quantity, unit price, and totals synced with Jobber.`);
        setIsImportModalOpen(false);
        setPastedText('');
        setAttachedFile(null);
      } else {
        onCatalogUpdated(nextCatalog);
        setFeedbackNotice(`✓ Applied ${parsedPreview.length} items to local catalog.`);
        setIsImportModalOpen(false);
      }
    } catch {
      onCatalogUpdated(importMode === 'REPLACE' ? parsedPreview : [...currentItems, ...parsedPreview]);
      setFeedbackNotice(`✓ Applied ${parsedPreview.length} price items.`);
      setIsImportModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToCanonical = async () => {
    if (!window.confirm('Reset service catalog back to the official Tidyups Cleaning Service Inc. price list?')) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/price-list/reset?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
      });
      const data = await res.json();
      if (data.success && data.items) {
        onCatalogUpdated(data.items);
        setFeedbackNotice('✓ Service catalog restored to canonical Tidyups prices.');
      } else {
        onCatalogUpdated(CANONICAL_SERVICE_CATALOG);
      }
    } catch {
      onCatalogUpdated(CANONICAL_SERVICE_CATALOG);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUnitPrice) return;
    setIsSaving(true);

    const qtyNum = Math.round(parseFloat(formQuantity || '1') * 100) / 100;
    const unitPriceNum = Math.round(parseFloat(formUnitPrice || '0') * 100) / 100;
    const totalNum = Math.round(qtyNum * unitPriceNum * 100) / 100;
    const depositNum = Math.round(parseFloat(formDeposit || '50') * 100) / 100;
    const cleanersNum = parseInt(formCleanersCount || '1', 10);

    const categoryLabel =
      formCategory === 'MOVE_OUT'
        ? 'Move-Out Cleaning 2026'
        : formCategory === 'DEEP_CLEAN'
        ? 'Deep Cleaning Services 2026'
        : formCategory === 'POST_CONSTRUCTION'
        ? 'MoveIn - Post Construction'
        : formCategory === 'ADD_ON'
        ? 'Add-on Services'
        : formCategory === 'RECURRING'
        ? 'Bi-Weekly Recurring Residential Clean'
        : formCategory === 'HOURLY'
        ? 'Hourly Crew Rates'
        : 'Initial Basic / Standard Cleaning 2026';

    const newItem: ServiceCatalogItem = {
      id: editingItem ? editingItem.id : `cat-item-${Date.now()}`,
      category: formCategory,
      categoryLabel,
      name: formName.trim(),
      shortName: formName.trim().length > 35 ? `${formName.trim().slice(0, 32)}...` : formName.trim(),
      serviceType: formServiceType,
      bedrooms: formCategory !== 'ADD_ON' && formCategory !== 'HOURLY' ? formBedrooms : undefined,
      bathrooms: formCategory !== 'ADD_ON' && formCategory !== 'HOURLY' ? formBathrooms : undefined,
      beds: formCategory !== 'ADD_ON' && formCategory !== 'HOURLY' ? formBedrooms : undefined,
      baths: formCategory !== 'ADD_ON' && formCategory !== 'HOURLY' ? formBathrooms : undefined,
      quantity: qtyNum,
      unitPrice: unitPriceNum,
      total: totalNum,
      basePrice: totalNum,
      baseHours: qtyNum,
      cleanersCount: cleanersNum,
      depositRequired: depositNum,
      taxable: true,
      jobberItemName: formName.trim(),
      description:
        formDescription.trim() ||
        `${formName.trim()}\n${cleanersNum} Pro Cleaner${cleanersNum > 1 ? 's' : ''}\nQuantity: ${qtyNum} @ $${unitPriceNum}/unit = $${totalNum.toFixed(2)} CAD`,
      isAddon: formCategory === 'ADD_ON',
      status: formStatus,
      isActive: formIsActive,
      sortOrder: editingItem ? editingItem.sortOrder : currentItems.length * 10,
    };

    let nextCatalog: ServiceCatalogItem[];
    if (editingItem) {
      nextCatalog = currentItems.map((item) => (item.id === editingItem.id ? newItem : item));
    } else {
      nextCatalog = [newItem, ...currentItems];
    }

    try {
      await fetch(`/api/price-list?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ items: nextCatalog }),
      });
      onCatalogUpdated(nextCatalog);
      setFeedbackNotice(`✓ Saved "${newItem.name}" (${newItem.quantity} @ $${newItem.unitPrice.toFixed(2)} = $${newItem.total.toFixed(2)}) to price list.`);
      setIsAddItemModalOpen(false);
      setEditingItem(null);
    } catch {
      onCatalogUpdated(nextCatalog);
      setIsAddItemModalOpen(false);
      setEditingItem(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!window.confirm(`Delete "${name}" from service catalog?`)) return;
    const nextCatalog = currentItems.filter((i) => i.id !== itemId);
    try {
      await fetch(`/api/price-list?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ items: nextCatalog }),
      });
      onCatalogUpdated(nextCatalog);
      setFeedbackNotice(`✓ Removed "${name}" from catalog.`);
    } catch {
      onCatalogUpdated(nextCatalog);
    }
  };

  const startEdit = (item: ServiceCatalogItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormServiceType(item.serviceType);
    setFormBedrooms(item.bedrooms || item.beds || '2 Bedrooms');
    setFormBathrooms(item.bathrooms || item.baths || '2 Bathrooms');
    setFormQuantity(String(item.quantity ?? item.baseHours ?? 1));
    setFormUnitPrice(String(item.unitPrice ?? item.basePrice ?? 105));
    setFormTotal(String(item.total ?? item.basePrice ?? 315));
    setFormCleanersCount(String(item.cleanersCount || 1));
    setFormDeposit(String(item.depositRequired || 0));
    setFormDescription(item.description || '');
    setFormStatus(item.status || 'Active');
    setFormIsActive(item.isActive !== false);
    setIsAddItemModalOpen(true);
  };

  const startAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('MOVE_OUT');
    setFormServiceType('Move-Out Cleaning');
    setFormBedrooms('2 Bedrooms');
    setFormBathrooms('2 Bathrooms');
    setFormQuantity('3.0');
    setFormUnitPrice('105.00');
    setFormTotal('315.00');
    setFormCleanersCount('2');
    setFormDeposit('100.00');
    setFormDescription('');
    setFormStatus('Active');
    setFormIsActive(true);
    setIsAddItemModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'SERVICE NAME/JOBBER LINE ITEM',
      'CATEGORY',
      'BEDS',
      'BATHS',
      'QUANTITY',
      'UNIT PRICE (CAD)',
      'TOTAL (CAD)',
      'STATUS',
      'ACTIVE?',
    ];
    const rows = currentItems.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.categoryLabel || item.category}"`,
      `"${item.bedrooms || item.beds || ''}"`,
      `"${item.bathrooms || item.baths || ''}"`,
      item.quantity ?? item.baseHours ?? 1,
      (item.unitPrice ?? item.basePrice ?? 0).toFixed(2),
      (item.total ?? item.basePrice ?? 0).toFixed(2),
      `"${item.status || 'Active'}"`,
      item.isActive !== false ? 'Yes' : 'No',
    ]);
    const csvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tidyups_service_catalog_price_list_${new Date().toISOString().slice(0, 10)}.tsv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ClipboardList className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Service Catalog &amp; Price List
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                  Jobber Line Items (Qty × Unit Price = Total)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Exact Jobber schema: Service Name, Quantity, Unit Price, and Total. Synced directly with quotes and bookings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Upload Excel, CSV, Google Sheets, or paste price list with quantities and unit prices"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Attach File / Paste Price List</span>
            </button>

            <button
              onClick={startAdd}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
              title="Export Price List to TSV / Excel Spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleResetToCanonical}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              title="Reset to official Tidyups price list"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Notice */}
        {feedbackNotice && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackNotice}</span>
            </div>
            <button onClick={() => setFeedbackNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Toolbar: Search & Category Chips */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by service name, bedrooms, rate, Jobber line item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>Showing {filteredItems.length} of {currentItems.length} items</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-xs font-medium no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Main Price List Table with exact schema */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Service Name / Jobber Line Item</th>
                <th className="py-2.5 px-2.5">Category</th>
                <th className="py-2.5 px-2.5">Beds / Baths</th>
                <th className="py-2.5 px-2.5 text-center">Quantity</th>
                <th className="py-2.5 px-2.5 text-right">Unit Price (CAD)</th>
                <th className="py-2.5 px-3 text-right">Total (CAD)</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm text-slate-600">No matching service items found</p>
                    <p className="text-xs mt-1">Try clearing your search or paste a new price list</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = item.quantity ?? item.baseHours ?? 1;
                  const unitPrice = item.unitPrice ?? item.basePrice ?? 0;
                  const total = item.total ?? (qty * unitPrice);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/40 transition-colors group"
                    >
                      {/* Name & Jobber Item */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-purple-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isAddon && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-100 text-pink-700">
                              Add-on
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-sm">
                          {item.jobberItemName || item.description}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.categoryLabel || item.category}
                        </span>
                      </td>

                      {/* Beds / Baths */}
                      <td className="py-2.5 px-2.5 text-slate-600 font-mono text-[11px]">
                        {item.bedrooms || item.bathrooms || item.beds || item.baths ? (
                          <div className="flex items-center gap-1">
                            {(item.bedrooms || item.beds) && <span>{item.bedrooms || item.beds}</span>}
                            {(item.bedrooms || item.beds) && (item.bathrooms || item.baths) && <span>•</span>}
                            {(item.bathrooms || item.baths) && <span>{item.bathrooms || item.baths}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {qty}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-700">
                        ${unitPrice.toFixed(2)}
                      </td>

                      {/* Total = Qty * Unit Price */}
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 text-xs">
                        ${total.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status || (item.isActive !== false ? 'Active' : 'Draft')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onSelectForQuote && (
                            <button
                              onClick={() => {
                                onSelectForQuote(item);
                                onClose();
                              }}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Add this line item to the current quote"
                            >
                              Use
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-800">
              Total Catalog Items: {currentItems.length}
            </span>
            <span>•</span>
            <span className="font-mono text-emerald-700 font-bold">
              Formula: Quantity × Unit Price = Total (CAD)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* ── PASTE / ATTACH / IMPORT PRICE LIST MODAL ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white">
                  <Upload className="w-4 h-4 text-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Attach File or Paste Price List
                  </h3>
                  <p className="text-xs text-slate-400">
                    Supports Excel (.xlsx / .xls), CSV, Google Sheets, or direct copy-paste with quantities &amp; unit prices
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Option 1: Attach File (Excel, CSV, Google Sheets download) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Attach Spreadsheet File (.xlsx, .xls, .csv, .tsv)
                </label>

                {attachedFile ? (
                  /* Persistent File Attached Display Card (Never disappears!) */
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-emerald-950 flex items-center gap-2">
                          <span>{attachedFile.name}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                            Attached &amp; Loaded
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          {attachedFile.type} • {attachedFile.sizeKb} KB •{' '}
                          <span className="font-bold">{attachedFile.itemCount} items detected</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearAttachedFile}
                      className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear File
                    </button>
                  </div>
                ) : (
                  /* File Picker Button & Drop Zone */
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl bg-slate-50 hover:bg-purple-50/30 transition-all">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Upload Excel (.xlsx, .xls) or CSV / TSV File
                        </div>
                        <div className="text-[11px] text-slate-500">
                          File name and parsed line items will stay loaded in the catalog
                        </div>
                      </div>
                    </div>

                    <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Spreadsheet</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv, .tsv, text/csv, text/tab-separated-values, text/plain"
                        onChange={handleFileSelected}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Option 2: Live Google Sheets URL */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Or Fetch from Google Sheets URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
                      value={googleSheetsUrl}
                      onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchGoogleSheets}
                    disabled={isFetchingSheet || !googleSheetsUrl.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {isFetchingSheet ? 'Fetching...' : 'Fetch Sheet'}
                  </button>
                </div>
              </div>

              {/* Option 3: Direct Paste Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    3. Or Paste Cells from Google Sheets / Excel / Text
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Columns: SERVICE NAME • CATEGORY • BEDS • BATHS • QUANTITY • UNIT PRICE • TOTAL
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`SERVICE NAME/JOBBER LINE ITEM	CATEGORY	BEDS	BATHS	QUANTITY	UNIT PRICE (CAD)	TOTAL (CAD)	STATUS	ACTIVE?
2Bed 2Bath Moveout Cleaning - Online Booking	Move-Out Cleaning	2 Bedrooms	2 Bathrooms	3	105.00	315.00	Active	Yes
Fuel Surcharge 2	Add-on Services			1	12.50	12.50	Active	Yes
Discount $10 Facebook Ad	Add-on Services			1	-10.00	-10.00	Active	Yes`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Import Mode: Append or Replace */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] uppercase font-mono">Mode:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'APPEND'}
                    onChange={() => setImportMode('APPEND')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Add / Update matching items (Keep existing)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'REPLACE'}
                    onChange={() => setImportMode('REPLACE')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Replace entire catalog with this list</span>
                </label>
              </div>

              {/* Live Detection Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Detected {parsedPreview.length} Price List Items with Quantities &amp; Rates</span>
                    </span>
                    <span className="text-[11px] font-mono text-purple-700 font-bold">
                      Total Catalog Value: ${parsedPreview.reduce((acc, p) => acc + (p.total ?? (p.quantity * p.unitPrice)), 0).toFixed(2)} CAD
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto rounded-xl border border-purple-200 bg-white">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-purple-100/60 text-purple-900 font-bold sticky top-0 text-[10px]">
                        <tr>
                          <th className="p-2">Service Name</th>
                          <th className="p-2">Beds/Baths</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Unit Price</th>
                          <th className="p-2 text-right">Total (CAD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100 font-mono">
                        {parsedPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-purple-50/50">
                            <td className="p-2 font-sans font-bold text-slate-800">
                              {item.name}
                            </td>
                            <td className="p-2 text-slate-500 text-[10px]">
                              {item.bedrooms || item.beds || item.bathrooms || item.baths ? (
                                `${item.bedrooms || item.beds || ''} ${item.bathrooms || item.baths || ''}`
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="p-2 text-center text-slate-700 font-bold">
                              {item.quantity}
                            </td>
                            <td className="p-2 text-right text-slate-700">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-bold text-emerald-700">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedPreview.length === 0 || isSaving}
                onClick={handleApplyPastedPriceList}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSaving ? 'Applying to Catalog...' : `Apply ${parsedPreview.length} Items to Service Catalog`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT ITEM MODAL ── */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Tag className="w-4 h-4 text-white" />
                </span>
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingItem ? 'Edit Service Catalog Item' : 'Add New Service Catalog Item'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service Name / Jobber Line Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2Bed 2Bath Moveout Cleaning - Online Booking"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ServiceCatalogItem['category'];
                      setFormCategory(cat);
                      if (cat === 'MOVE_OUT') setFormServiceType('Move-Out Cleaning');
                      else if (cat === 'DEEP_CLEAN') setFormServiceType('Deep Cleaning');
                      else if (cat === 'POST_CONSTRUCTION') setFormServiceType('Post-Construction Cleaning');
                      else if (cat === 'ADD_ON') setFormServiceType('Add-on');
                      else if (cat === 'HOURLY') setFormServiceType('Hourly Crew Rates' as any);
                      else setFormServiceType('Standard Cleaning');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 bg-white font-medium"
                  >
                    <option value="MOVE_OUT">Move-Out Cleaning 2026</option>
                    <option value="DEEP_CLEAN">Deep Cleaning Services 2026</option>
                    <option value="STANDARD_CLEAN">Initial / Standard Clean 2026</option>
                    <option value="POST_CONSTRUCTION">MoveIn - Post Construction</option>
                    <option value="RECURRING">Bi-Weekly Recurring Residential Clean</option>
                    <option value="ADD_ON">Add-on Services</option>
                    <option value="HOURLY">Hourly Crew Rates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {formCategory !== 'ADD_ON' && formCategory !== 'HOURLY' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bedrooms</label>
                    <select
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 bg-white"
                    >
                      <option value="Studio Apartment">Studio Apartment</option>
                      <option value="1 Bedroom">1 Bedroom</option>
                      <option value="2 Bedrooms">2 Bedrooms</option>
                      <option value="3 Bedrooms">3 Bedrooms</option>
                      <option value="4 Bedrooms">4 Bedrooms</option>
                      <option value="5 Bedrooms">5 Bedrooms</option>
                      <option value="6+ Bedrooms">6+ Bedrooms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bathrooms</label>
                    <select
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 bg-white"
                    >
                      <option value="1 Bathroom">1 Bathroom</option>
                      <option value="1.5 Bathrooms">1.5 Bathrooms</option>
                      <option value="2 Bathrooms">2 Bathrooms</option>
                      <option value="2.5 Bathrooms">2.5 Bathrooms</option>
                      <option value="3 Bathrooms">3 Bathrooms</option>
                      <option value="3.5 Bathrooms">3.5 Bathrooms</option>
                      <option value="4+ Bathrooms">4+ Bathrooms</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Exact Jobber Calculation: Quantity * Unit Price = Total */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-[11px]">
                  <Calculator className="w-3.5 h-3.5 text-purple-600" />
                  <span>Jobber Formula: Quantity × Unit Price = Total</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formQuantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Hours or Units</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit Price ($ CAD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formUnitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-purple-700 bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Per unit or per hour</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total ($ CAD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formTotal}
                      onChange={(e) => setFormTotal(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-xl font-mono font-extrabold text-emerald-700 bg-emerald-50/50"
                    />
                    <span className="text-[10px] text-emerald-600 mt-0.5 block">Synced with Jobber</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cleaners Crew</label>
                  <select
                    value={formCleanersCount}
                    onChange={(e) => setFormCleanersCount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="1">1 Solo Cleaner</option>
                    <option value="2">2 Pro Cleaners (Tandem Crew)</option>
                    <option value="3">3 Cleaners Crew</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deposit Required ($)</label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Line Item Description (Jobber &amp; Customer View)
                </label>
                <textarea
                  rows={2}
                  placeholder={`2Bed 2Bath Moveout Cleaning\n2 Pro Cleaners\nIncludes Fuel Surcharge`}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Update Line Item' : 'Add to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
