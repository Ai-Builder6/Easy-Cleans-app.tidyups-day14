import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  ServiceCatalogItem,
  CANONICAL_SERVICE_CATALOG,
  parsePastedPriceList,
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

  // Form state for Add/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCatalogItem['category']>('MOVE_OUT');
  const [formServiceType, setFormServiceType] = useState<ServiceCatalogItem['serviceType']>('Move-Out Cleaning');
  const [formBedrooms, setFormBedrooms] = useState('3 Bedrooms');
  const [formBathrooms, setFormBathrooms] = useState('2 Bathrooms');
  const [formBasePrice, setFormBasePrice] = useState('325.00');
  const [formBaseHours, setFormBaseHours] = useState('3.5');
  const [formCleanersCount, setFormCleanersCount] = useState('1');
  const [formDeposit, setFormDeposit] = useState('100.00');
  const [formDescription, setFormDescription] = useState('');

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
        String(item.basePrice).includes(q)
      );
    });
  }, [currentItems, selectedCategory, search]);

  // Preview of pasted text
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

  const handleApplyPastedPriceList = async () => {
    if (parsedPreview.length === 0) return;
    setIsSaving(true);
    try {
      const nextCatalog =
        importMode === 'REPLACE'
          ? parsedPreview
          : [...currentItems.filter((c) => !parsedPreview.some((p) => p.name.toLowerCase() === c.name.toLowerCase())), ...parsedPreview];

      const res = await fetch(`/api/price-list?project=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': projectId },
        body: JSON.stringify({ items: nextCatalog }),
      });
      const data = await res.json();
      if (data.success && data.items) {
        onCatalogUpdated(data.items);
        setFeedbackNotice(`✓ Successfully imported ${parsedPreview.length} price list items! Line items synced with Jobber.`);
        setIsImportModalOpen(false);
        setPastedText('');
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
    if (!formName.trim() || !formBasePrice) return;
    setIsSaving(true);

    const priceNum = Math.round(parseFloat(formBasePrice) * 100) / 100;
    const hoursNum = Math.round(parseFloat(formBaseHours || '3') * 10) / 10;
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
      baseHours: hoursNum,
      cleanersCount: cleanersNum,
      basePrice: priceNum,
      depositRequired: depositNum,
      taxable: true,
      jobberItemName: formName.trim(),
      description: formDescription.trim() || `${formName.trim()} - Tidyups Cleaning Service Inc.`,
      isAddon: formCategory === 'ADD_ON',
      isActive: true,
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
      setFeedbackNotice(`✓ Saved "${newItem.name}" ($${newItem.basePrice.toFixed(2)}) to price list.`);
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
    setFormBedrooms(item.bedrooms || '3 Bedrooms');
    setFormBathrooms(item.bathrooms || '2 Bathrooms');
    setFormBasePrice(String(item.basePrice));
    setFormBaseHours(String(item.baseHours));
    setFormCleanersCount(String(item.cleanersCount));
    setFormDeposit(String(item.depositRequired));
    setFormDescription(item.description || '');
    setIsAddItemModalOpen(true);
  };

  const startAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('MOVE_OUT');
    setFormServiceType('Move-Out Cleaning');
    setFormBedrooms('3 Bedrooms');
    setFormBathrooms('2 Bathrooms');
    setFormBasePrice('325.00');
    setFormBaseHours('3.5');
    setFormCleanersCount('1');
    setFormDeposit('100.00');
    setFormDescription('');
    setIsAddItemModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
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
                  Jobber Line Items Sync
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Official prices, line items, and bedroom/bathroom configurations synced with Jobber &amp; Quotes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Paste / Import Price List</span>
            </button>

            <button
              onClick={startAdd}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>

            <button
              onClick={handleResetToCanonical}
              title="Restore standard Tidyups rates"
              className="p-2 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl border border-white/10 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackNotice && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
            <button onClick={() => setFeedbackNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-150 bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service, bed/bath, or price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Catalog Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Category Accent Stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    item.category === 'MOVE_OUT'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : item.category === 'DEEP_CLEAN'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      : item.category === 'POST_CONSTRUCTION'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : item.category === 'ADD_ON'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        item.category === 'MOVE_OUT'
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : item.category === 'DEEP_CLEAN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : item.category === 'POST_CONSTRUCTION'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : item.category === 'ADD_ON'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                        title="Edit price or details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Delete from catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug tracking-tight">
                    {item.name}
                  </h3>

                  {(item.bedrooms || item.bathrooms) && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-slate-700">
                      {item.bedrooms && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          <BedDouble className="w-3 h-3 text-purple-600" />
                          <span>{item.bedrooms}</span>
                        </span>
                      )}
                      {item.bathrooms && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          <Bath className="w-3 h-3 text-pink-600" />
                          <span>{item.bathrooms}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Jobber Base Rate
                      </div>
                      <div className="font-mono text-xl font-black text-emerald-700">
                        ${item.basePrice.toFixed(2)}{' '}
                        <span className="text-[10px] font-semibold text-slate-400 font-sans">CAD</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Required Deposit
                      </div>
                      <div className="font-mono text-xs font-bold text-purple-700">
                        ${item.depositRequired.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.baseHours} hrs</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{item.cleanersCount === 1 ? '1 Solo Cleaner' : `${item.cleanersCount} Cleaners Crew`}</span>
                    </span>
                  </div>

                  {onSelectForQuote && (
                    <button
                      onClick={() => {
                        onSelectForQuote(item);
                        onClose();
                      }}
                      className="w-full mt-3 py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold border border-purple-200/80 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Use in Quote</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-extrabold text-slate-800 text-base">No items match your search</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for another service, or click &quot;Paste / Import Price List&quot; to load your pricing.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All catalog line items auto-sync with <strong>Jobber GraphQL API (v2025-04-16)</strong> quote draft creation.
            </span>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(currentItems, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tidyups-service-catalog-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* ── PASTE / IMPORT PRICE LIST MODAL ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white">
                  <Upload className="w-4 h-4 text-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Paste &amp; Import Price List</h3>
                  <p className="text-xs text-slate-400">
                    Paste your price list from previous spreadsheets, text, or Jobber line items
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
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Paste Price List Text / CSV / Spreadsheet Lines
                </label>
                <textarea
                  rows={8}
                  placeholder={`Example plain text:
3 Bed 2 Bath Move Out: $325 (3.5 hrs)
4 Bed 3 Bath Move Out: $495 (5.0 hrs)
Inside Oven: $45
Inside Fridge: $45
Deep Clean 2 Bed 2 Bath: $197.50

Or CSV format:
Service, Price, Hours
Move Out 3 Bed 2 Bath, 325, 3.5`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Import Mode: Append or Replace */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
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
                  <span>Replace entire catalog with pasted list</span>
                </label>
              </div>

              {/* Live Detection Preview */}
              {pastedText.trim() && (
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Detected {parsedPreview.length} Price List Items</span>
                    </span>
                    <span className="text-[11px] font-mono text-purple-700">
                      Total Catalog Value: ${parsedPreview.reduce((acc, p) => acc + p.basePrice, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {parsedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-purple-100"
                      >
                        <div className="truncate max-w-[320px]">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          {(item.bedrooms || item.bathrooms) && (
                            <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                              ({item.bedrooms || ''} {item.bathrooms || ''})
                            </span>
                          )}
                        </div>
                        <div className="font-mono font-bold text-emerald-700 shrink-0">
                          ${item.basePrice.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                <span>{isSaving ? 'Applying to Catalog...' : `Apply ${parsedPreview.length} Items to Catalog`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT ITEM MODAL ── */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
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
                <label className="block font-bold text-slate-700 mb-1">Service / Line Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3Bed 2Bath Moveout Cleaning 2026"
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
                  <label className="block font-bold text-slate-700 mb-1">Base Price ($ CAD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 font-mono font-bold text-emerald-700"
                  />
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formBaseHours}
                    onChange={(e) => setFormBaseHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cleaners Crew</label>
                  <select
                    value={formCleanersCount}
                    onChange={(e) => setFormCleanersCount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="1">1 Solo Cleaner</option>
                    <option value="2">2 Cleaners Crew</option>
                    <option value="3">3 Cleaners Crew</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deposit ($)</label>
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
                <label className="block font-bold text-slate-700 mb-1">Line Item Description (Jobber &amp; Customer View)</label>
                <textarea
                  rows={2}
                  placeholder="Detailed breakdown for quotes and invoices..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
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
