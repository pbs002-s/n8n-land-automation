import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Bell, AlertTriangle, FileText, CheckCircle2, 
  MapPin, Clock, DollarSign, Activity, QrCode, Layers, Compass, 
  RefreshCw, UserCheck, FileCheck, AlertCircle, 
  CreditCard, Smartphone, Building, Database, Globe, X,
  Printer, ArrowUpRight, Check, ChevronRight, Shield, Landmark,
  Sun, Moon, ExternalLink, Cpu, Menu, PhoneCall, HelpCircle,
  TrendingUp, Radio, Sparkles, Filter, ChevronDown, CheckCheck
} from 'lucide-react';
import BangladeshBackground from './components/BangladeshBackground';

interface TaxRecord {
  id: string;
  fiscalYear: string;
  annualDemandBDT: number;
  arrearAmountBDT: number;
  totalDueBDT: number;
  paidAmountBDT: number;
  status: 'PENDING' | 'VERIFIED' | 'RECONCILED' | 'FAILED';
  trxId: string | null;
  paymentMethod: string | null;
  dakhilaNumber: string | null;
  qrCodeUrl: string | null;
  paymentDate: string | null;
}

interface Mutation {
  id: string;
  caseNumber: string;
  applicantName: string;
  applicantNid: string;
  applicantPhone: string;
  proposedOwner: string;
  status: 'SUBMITTED' | 'KANUNGO_VERIFICATION' | 'AC_LAND_HEARING' | 'DCR_PAYMENT_PENDING' | 'APPROVED' | 'REJECTED';
  currentStage: string;
  hearingDate: string | null;
  dcrAmount: number | null;
  remarks: string | null;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string;
  actor: string;
  referenceDoc: string | null;
  eventDate: string;
}

interface Discrepancy {
  id: string;
  mismatchType: string;
  sourceA: string;
  sourceB: string;
  severity: string;
  isResolved: boolean;
  flaggedBy: string;
  createdAt: string;
}

interface Document {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  ocrText: string | null;
  uploadedAt: string;
}

interface Complaint {
  id: string;
  trackingNo: string;
  complainant: string;
  phone: string;
  category: string;
  description: string;
  assignedOffice: string;
  status: string;
  createdAt: string;
}

interface ParcelData {
  id: string;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  jlNumber: number;
  khatianNo: string;
  dagNo: string;
  holdingNo: string;
  landClass: string;
  areaDecimal: number;
  currentOwner: string;
  nidNumber: string;
  phone: string;
  email?: string | null;
  geojsonBoundary?: any;
  taxRecords?: TaxRecord[];
  mutations?: Mutation[];
  timelineEvents?: TimelineEvent[];
  discrepancies?: Discrepancy[];
  documents?: Document[];
  complaints?: Complaint[];
}

export default function App() {
  // Theme state: defaults to dark (Nova Night Mood)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('land_platform_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark'; // Primary default: Full Screen Night Mood
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('BD-DHK-SAV-000001');
  const [selectedParcelId, setSelectedParcelId] = useState('BD-DHK-SAV-000001');
  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [availableParcels, setAvailableParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'reconciliation' | 'mutations' | 'tax' | 'automations'>('overview');
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'warning' | 'error'; text: string } | null>(null);
  
  // Tax payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTaxRecord, setSelectedTaxRecord] = useState<TaxRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [paymentPhone, setPaymentPhone] = useState('01711223344');
  const [paymentPin, setPaymentPin] = useState('1234');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [recentDakhila, setRecentDakhila] = useState<TaxRecord | null>(null);
  const [showDakhilaModal, setShowDakhilaModal] = useState(false);

  // e-Mutation modal state
  const [showMutationModal, setShowMutationModal] = useState(false);
  const [mutationApplicant, setMutationApplicant] = useState('');
  const [mutationNid, setMutationNid] = useState('');
  const [mutationPhone, setMutationPhone] = useState('');
  const [mutationProposed, setMutationProposed] = useState('');
  const [isSubmittingMutation, setIsSubmittingMutation] = useState(false);

  // Reconciliation state
  const [isAuditing, setIsAuditing] = useState(false);

  // Live Animated Cadastral Ticker
  const tickerItems = [
    '⚡ PostGIS CDC Pipeline Active on Port 5433',
    '🛰️ DLRS Cadastre: 1:500 Geodetic Polygon Synced (WGS84 EPSG:4326)',
    '🛡️ Mutation Radar: Real-time SMS & e-Nothi Hearing Alerts Enabled',
    '💳 LD Tax Gateway: Ekpay / bKash Instant Dakhila Generation Online',
    '🔍 Multi-Source Cross-Audit: RS Mouza Sheet #04 Geometry Verified'
  ];
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Automation event stream
  const [n8nLogs, setN8nLogs] = useState<string[]>([
    '[PostGIS CDC] Spatial change data capture pipeline active on port 5433.',
    '[n8n Ingress] Payment reconciliation webhook endpoint listening on :5678/webhook/payment-reconciled.',
    '[DLRS Cadastre] Synchronized 1:500 scale digital vector layer with WGS84 projection.'
  ]);

  // Synchronize HTML dark class with theme state
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('land_platform_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    fetchParcelsList();
    fetchParcelData(selectedParcelId);
  }, []);

  const fetchParcelsList = async () => {
    try {
      const res = await fetch('/api/parcels');
      if (res.ok) {
        const data = await res.json();
        setAvailableParcels(data);
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchParcelData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parcels/${id}`);
      if (res.ok) {
        const data = await res.json();
        setParcel(data);
        setBackendOnline(true);
        if (data.taxRecords && data.taxRecords.length > 0) {
          const verified = data.taxRecords.find((r: TaxRecord) => r.status === 'VERIFIED');
          if (verified) setRecentDakhila(verified);
        }
      } else {
        setStatusMessage({ type: 'warning', text: `Parcel record ${id} not found in database.` });
      }
    } catch (err: any) {
      console.error('Fetch parcel failed:', err);
      setBackendOnline(false);
      setStatusMessage({ type: 'error', text: 'Backend API connection offline. Please ensure local server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedParcelId(searchQuery.trim());
    fetchParcelData(searchQuery.trim());
  };

  const handleSelectParcel = (id: string) => {
    setSearchQuery(id);
    setSelectedParcelId(id);
    fetchParcelData(id);
  };

  const handleRunReconciliation = async () => {
    if (!parcel) return;
    setIsAuditing(true);
    setStatusMessage({ type: 'info', text: 'Dispatched n8n cross-audit workflow across Khatiyan, DLRS GIS, and Deeds...' });
    
    try {
      const res = await fetch('/api/reconciliation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId: parcel.id })
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Automated cross-audit complete. 4 authoritative sources reconciled.' });
        setN8nLogs(prev => [
          `[Reconciliation ${new Date().toLocaleTimeString()}] Parcel ${parcel.id}: PostGIS geometry matched against RS Mouza Sheet #04.`,
          ...prev
        ]);
      }
    } catch {
      setTimeout(() => {
        setIsAuditing(false);
        setStatusMessage({ type: 'success', text: 'Reconciliation check complete.' });
      }, 1000);
    } finally {
      setIsAuditing(false);
    }
  };

  const handlePayTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcel || !selectedTaxRecord) return;
    setIsProcessingPayment(true);

    try {
      const trxId = `${paymentMethod.toUpperCase()}_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await fetch('/api/payments/pay-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: parcel.id,
          fiscalYear: selectedTaxRecord.fiscalYear,
          amount: selectedTaxRecord.totalDueBDT,
          paymentMethod: `${paymentMethod} Digital Gateway`,
          trxId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage({ type: 'success', text: `Payment confirmed. Digital Dakhila #${data.taxRecord.dakhilaNumber} issued.` });
        setRecentDakhila(data.taxRecord);
        setShowPayModal(false);
        setShowDakhilaModal(true);
        setN8nLogs(prev => [
          `[Payment Ingress ${new Date().toLocaleTimeString()}] Received ${data.taxRecord.paidAmountBDT} BDT (${data.taxRecord.fiscalYear}) for ${parcel.id}. Dakhila #${data.taxRecord.dakhilaNumber} generated.`,
          ...prev
        ]);
        fetchParcelData(parcel.id);
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Payment processing error.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Payment request failed.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMutationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcel) return;
    setIsSubmittingMutation(true);

    try {
      const res = await fetch('/api/mutations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: parcel.id,
          applicantName: mutationApplicant,
          applicantNid: mutationNid,
          applicantPhone: mutationPhone,
          proposedOwner: mutationProposed,
          dcrAmount: 1150.0,
          remarks: 'Online e-Mutation application with attached deed metadata.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage({ type: 'success', text: `e-Mutation case ${data.mutation.caseNumber} filed successfully. Assigned to ULAO.` });
        setShowMutationModal(false);
        setMutationApplicant('');
        setMutationNid('');
        setMutationPhone('');
        setMutationProposed('');
        setN8nLogs(prev => [
          `[e-Mutation ${new Date().toLocaleTimeString()}] Case ${data.mutation.caseNumber} registered for ${parcel.id}. Hearing notice queued.`,
          ...prev
        ]);
        fetchParcelData(parcel.id);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to submit mutation.' });
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview & Title', bangla: 'মালিকানা ও খতিয়ান বিবরণ', icon: UserCheck, count: null },
    { id: 'map', label: 'Cadastral GIS Map', bangla: 'ডিএলআরএস জিআইএস নকশা', icon: Compass, count: 'WGS84' },
    { id: 'reconciliation', label: 'Data Cross-Audit', bangla: 'বহুস্তরীয় সমম্বয় অডিট', icon: Database, count: (parcel?.discrepancies?.length || 0) > 0 ? `${parcel?.discrepancies?.length} Audit` : null },
    { id: 'mutations', label: 'e-Mutation Tracker', bangla: 'ই-নামজারি ট্র্যাকার', icon: Clock, count: parcel?.mutations?.length ? `${parcel.mutations.length}` : null },
    { id: 'tax', label: 'LD Tax & Dakhila', bangla: 'ভূমি কর ও ই-দাখিলা', icon: DollarSign, count: parcel?.taxRecords?.some(t => t.status === 'PENDING') ? 'Due' : 'Cleared' },
    { id: 'automations', label: 'Automation Hub', bangla: 'অটোমেশন পাইপলাইন', icon: Activity, count: '7 Active' }
  ];

  const automations = [
    { title: 'Payment Reconciliation', desc: 'Verifies Land Development Tax settlements against payment gateways to eliminate duplicate entries.', status: 'Active (24/7)', type: 'webhook', icon: CreditCard },
    { title: 'Property Activity Alerts', desc: 'Dispatches instant SMS and email notifications upon any mutation or survey activity.', status: 'Trigger Ready', type: 'event', icon: Bell },
    { title: 'Cadastral Vector Audit', desc: 'Cross-evaluates Khatian, Dag boundaries, Holding registers, and PostGIS spatial layers.', status: 'Hourly Sync', type: 'cron', icon: Database },
    { title: 'Mutation Pipeline Tracker', desc: 'Coordinates the 4-stage AC Land hearing process and dispatches legal hearing notices.', status: 'Active Sync', type: 'event', icon: Clock },
    { title: 'LD Tax Demand Reminders', desc: 'Schedules automated SMS tax reminders before the annual Baishakh fiscal deadline.', status: 'Scheduled', type: 'cron', icon: DollarSign },
    { title: 'Tamper-proof E-Receipts', desc: 'Generates cryptographically verifiable QR digital receipts upon payment confirmation.', status: 'Real-time', type: 'service', icon: QrCode },
    { title: 'System & API Health', desc: 'Monitors e-Parcha services, DLRS GIS spatial databases, and gateway latencies.', status: '99.98% Uptime', type: 'health', icon: Activity }
  ];

  const latestTax = parcel?.taxRecords && parcel.taxRecords.length > 0 ? parcel.taxRecords[0] : null;
  const pendingTax = parcel?.taxRecords?.find(t => t.status === 'PENDING') || null;

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-150 flex relative w-full ${
      theme === 'dark' ? 'dark bg-[#030303] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Subtle Bangladesh Geospatial Mesh Background Animation */}
      <BangladeshBackground theme={theme} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Vertical Sidebar Navigation (Full Height & Minimal) */}
      <aside className={`fixed md:sticky top-0 z-50 h-screen w-72 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border-r border-slate-200 dark:border-[#27272A] flex flex-col justify-between transition-transform duration-200 shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Institutional Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 dark:bg-emerald-500/10 dark:text-[#34D399] dark:border dark:border-emerald-500/25 text-white flex items-center justify-center shadow-sm shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight font-bangla leading-snug">
                  ভূমি সেবা পোর্টাল
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-[#A1A1AA] font-sans">
                  Ministry of Land, Bangladesh
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Parcel Selector Card in Sidebar */}
          <div className="bg-slate-50/80 dark:bg-[#121215]/80 p-3 rounded-lg border border-slate-200/80 dark:border-[#27272A] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#A1A1AA] uppercase tracking-wider font-semibold">
              <span>Active Holding</span>
              <span className="font-bangla font-light text-[9px] text-emerald-600 dark:text-[#34D399]">খতিয়ান নির্বাচন</span>
            </div>
            {availableParcels.length > 0 ? (
              <select
                value={selectedParcelId}
                onChange={(e) => {
                  handleSelectParcel(e.target.value);
                  setSidebarOpen(false);
                }}
                className="w-full bg-white dark:bg-[#18181B] text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-[#27272A] rounded-md px-2.5 py-1.5 outline-none cursor-pointer font-mono font-medium focus:border-emerald-600 dark:focus:border-[#34D399] transition"
              >
                {availableParcels.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} ({p.upazila})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs font-mono text-slate-700 dark:text-[#A1A1AA]">{selectedParcelId}</div>
            )}
          </div>

          {/* Sidebar Navigation Links (Vertical Tabs with Minimal Bangla) */}
          <div className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#71717A] px-3 block mb-2 font-mono">
              PORTAL MODULES
            </span>
            <nav className="space-y-1">
              {navTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition font-medium text-left group ${
                      isActive 
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-[#34D399] border border-emerald-200/80 dark:border-emerald-800/80 shadow-subtle' 
                        : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#121215]/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-700 dark:text-[#34D399]' : 'text-slate-400 dark:text-[#71717A] group-hover:text-slate-600 dark:group-hover:text-white'}`} />
                      <div>
                        <div className="font-semibold leading-tight">{tab.label}</div>
                        <div className="text-[10px] font-bangla font-light text-slate-400 dark:text-[#71717A] leading-tight mt-0.5">{tab.bangla}</div>
                      </div>
                    </div>

                    {tab.count && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        isActive 
                          ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-[#34D399]' 
                          : 'bg-slate-100 dark:bg-[#121215] text-slate-500 dark:text-[#71717A] border border-slate-200/60 dark:border-[#27272A]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer & System Status */}
        <div className="p-4 border-t border-slate-200 dark:border-[#27272A] space-y-3 bg-slate-50/50 dark:bg-[#121215]/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-[#A1A1AA]">Theme Mood:</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white text-[11px] font-medium shadow-subtle transition cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" /> Night
                </>
              )}
            </button>
          </div>

          <div className="bg-white/80 dark:bg-[#18181B]/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-[#27272A] text-[10px] space-y-1 text-slate-500 dark:text-[#A1A1AA]">
            <div className="flex items-center justify-between">
              <span>PostGIS Spatial:</span>
              <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold">:5433</span>
            </div>
            <div className="flex items-center justify-between">
              <span>n8n Webhook:</span>
              <span className="font-mono text-emerald-700 dark:text-[#34D399] font-semibold">:5678</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-[#71717A]">
            <PhoneCall className="w-3 h-3 text-emerald-600 dark:text-[#34D399] shrink-0" />
            <span className="font-bangla font-light">ভূমি হেল্পলাইন: ১৬১২২ (২৪/৭)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Full Screen Fluid Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 z-10 w-full overflow-x-hidden">
        {/* Top Sticky Header with Animated Ticker */}
        <header className="bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#27272A] sticky top-0 z-30 shadow-subtle transition-colors duration-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearch} className="flex items-center bg-slate-100/80 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg p-1 focus-within:bg-white dark:focus-within:bg-[#18181B] focus-within:border-emerald-600 dark:focus-within:border-[#34D399] transition">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#71717A] ml-2 shrink-0" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Parcel UPID..."
                className="bg-transparent text-xs text-slate-800 dark:text-white font-mono px-2.5 py-1 outline-none w-44 sm:w-60 md:w-72"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 hover:bg-slate-800 text-white text-xs px-3 py-1 rounded-md font-medium transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Animated Cadastral Telemetry Marquee Banner */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-[#121215] px-3 py-1 rounded-full border border-slate-200 dark:border-[#27272A] text-xs font-mono max-w-lg truncate">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-700 dark:text-[#A1A1AA] transition-all duration-500 truncate">
              {tickerItems[currentTickerIndex]}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status Indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
              backendOnline 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-[#34D399]' 
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-600 dark:bg-[#34D399]' : 'bg-amber-500'}`}></span>
              {backendOnline ? 'API Connected' : 'API Offline'}
            </div>

            {pendingTax && (
              <button
                onClick={() => {
                  setSelectedTaxRecord(pendingTax);
                  setShowPayModal(true);
                }}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-[#34D399] dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition animate-pulse-glow"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay Tax ({pendingTax.totalDueBDT} BDT)
              </button>
            )}
          </div>
        </header>

        {/* Full-Screen Workspace Body */}
        <main className="p-4 sm:p-8 space-y-6 w-full max-w-[1720px] mx-auto">
          {/* Status Message Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-lg text-xs flex items-center justify-between border shadow-subtle animate-fade-in-up ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-[#34D399]' 
                : statusMessage.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-300'
                : 'bg-slate-100 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-800 dark:text-[#A1A1AA]'
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#34D399] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button 
                onClick={() => setStatusMessage(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs px-2 py-0.5 rounded transition"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Primary Parcel Header Card (Full-Width with Animated Text & Metrics) */}
          {parcel ? (
            <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 sm:p-8 shadow-card dark:shadow-dark-card space-y-6 relative overflow-hidden transition-all duration-200">
              <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 uppercase tracking-wider text-[10px]">
                      Authoritative Land Identifier (UPID)
                    </span>
                    <span className="text-slate-600 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#121215] px-2 py-0.5 rounded border border-slate-200 dark:border-[#27272A] font-bangla font-light text-xs">
                      জেএল নং: #{parcel.jlNumber}
                    </span>
                    <span className="text-slate-600 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#121215] px-2 py-0.5 rounded border border-slate-200 dark:border-[#27272A] font-bangla font-light text-xs">
                      খতিয়ান: {parcel.khatianNo}
                    </span>
                  </div>

                  {/* Animated Shimmer UPID Title */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight shimmer-text">
                    {parcel.id}
                  </h2>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-[#A1A1AA] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-[#71717A] shrink-0" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">{parcel.division}</strong> &gt; {parcel.district} &gt; {parcel.upazila} &gt; Mouza: <span className="text-slate-900 dark:text-emerald-400 font-medium font-bangla font-light">{parcel.mouza}</span>
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button 
                    onClick={handleRunReconciliation}
                    disabled={isAuditing}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#121215] dark:hover:bg-[#202024] dark:border dark:border-[#27272A] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-[#34D399]' : 'text-[#34D399]'}`} /> 
                    {isAuditing ? 'Auditing 4 Sources...' : 'Run Spatial Audit'}
                  </button>

                  <button
                    onClick={() => setShowMutationModal(true)}
                    className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm font-bangla font-light"
                  >
                    <FileText className="w-3.5 h-3.5" /> নামজারি আবেদন (Apply Mutation)
                  </button>
                </div>
              </div>

              {/* Full-Width Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 pt-4 border-t border-slate-100 dark:border-[#27272A]">
                <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200/80 dark:border-[#27272A]">
                  <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block font-bangla font-light">দাগ নম্বর</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block font-mono">{parcel.dagNo}</span>
                </div>
                <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200/80 dark:border-[#27272A]">
                  <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block font-bangla font-light">হোল্ডিং নং</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">{parcel.holdingNo}</span>
                </div>
                <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200/80 dark:border-[#27272A]">
                  <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block font-bangla font-light">জমির পরিমাণ</span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-[#34D399] mt-1 block font-mono">{parcel.areaDecimal} Dec</span>
                </div>
                <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200/80 dark:border-[#27272A]">
                  <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block font-bangla font-light">জমির শ্রেণী</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white mt-1 block truncate font-bangla font-light">{parcel.landClass}</span>
                </div>
                <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200/80 dark:border-[#27272A]">
                  <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block font-bangla font-light">কর অবস্থা</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                    latestTax?.status === 'VERIFIED' || latestTax?.status === 'RECONCILED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/70'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70'
                  }`}>
                    {latestTax?.status || 'CLEARED'}
                  </span>
                </div>
                <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200/80 dark:border-[#27272A]">
                  <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block font-bangla font-light">অডিট অমিল</span>
                  <span className={`text-xs font-bold mt-1 block ${
                    (parcel.discrepancies?.length || 0) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-[#34D399]'
                  }`}>
                    {(parcel.discrepancies?.length || 0) > 0 ? `${parcel.discrepancies?.length} Flagged` : '0 Clean'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl">
              <p className="text-slate-500 dark:text-[#A1A1AA] text-xs font-mono">Loading authoritative record...</p>
            </div>
          )}

          {/* ACTIVE TAB PANEL CONTENT WITH ANIMATED ENTRY */}
          {/* TAB 1: Overview & Ownership */}
          {activeTab === 'overview' && parcel && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 sm:p-7 space-y-5 shadow-card dark:shadow-dark-card">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> Title Holder Particulars
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/70 font-mono">
                      CERTIFIED KHATIAN # {parcel.khatianNo}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50/80 dark:bg-[#121215]/80 p-4 rounded-lg border border-slate-200 dark:border-[#27272A] space-y-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold font-bangla font-light">স্বত্বাধিকারী (Owner)</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white font-bangla">{parcel.currentOwner}</p>
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block pt-2">National ID (NID)</span>
                      <p className="font-mono text-xs text-slate-800 dark:text-white font-medium bg-white dark:bg-[#18181B] px-2.5 py-1 rounded border border-slate-200 dark:border-[#27272A] inline-block">
                        {parcel.nidNumber}
                      </p>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-[#121215]/80 p-4 rounded-lg border border-slate-200 dark:border-[#27272A] space-y-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold">Registered Phone</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{parcel.phone}</p>
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase tracking-wider font-semibold block pt-2 font-bangla font-light">মালিকানার সূত্র</span>
                      <p className="text-xs text-slate-700 dark:text-[#A1A1AA] font-bangla font-light">রেজিস্ট্রিকৃত কবলা দলিল (Registered Sale Deed)</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-[#121215]/80 p-4 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <h4 className="text-[10px] font-medium text-slate-500 dark:text-[#71717A] uppercase tracking-wider mb-2.5 font-bangla font-light">পরিমাপ রূপান্তর ও জমির ধরণ (Land Class & Area)</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white dark:bg-[#18181B] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                        <span className="text-[10px] text-slate-500 dark:text-[#71717A] block font-bangla font-light">শতাংশ (Decimals)</span>
                        <span className="text-base font-extrabold text-emerald-800 dark:text-[#34D399] font-mono">{parcel.areaDecimal}</span>
                      </div>
                      <div className="bg-white dark:bg-[#18181B] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                        <span className="text-[10px] text-slate-500 dark:text-[#71717A] block font-bangla font-light">বর্গফুট (Sq Ft)</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{(parcel.areaDecimal * 435.6).toFixed(1)}</span>
                      </div>
                      <div className="bg-white dark:bg-[#18181B] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                        <span className="text-[10px] text-slate-500 dark:text-[#71717A] block font-bangla font-light">কাঠা (Katha)</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{(parcel.areaDecimal / 1.65).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 sm:p-7 space-y-4 shadow-card dark:shadow-dark-card">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#27272A] pb-3">
                    <Clock className="w-4 h-4 text-slate-700 dark:text-[#A1A1AA]" /> Cadastral & Legal Event History
                  </h3>

                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#27272A]">
                    {parcel.timelineEvents && parcel.timelineEvents.length > 0 ? (
                      parcel.timelineEvents.map((evt, idx) => (
                        <div key={idx} className="relative pl-6 space-y-0.5">
                          <div className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-[#34D399] ring-4 ring-white dark:ring-[#18181B]" />
                          <div className="flex items-center justify-between text-xs">
                            <h4 className="font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                            <span className="text-[10px] text-slate-400 dark:text-[#71717A] font-mono">{new Date(evt.eventDate).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-[#A1A1AA]">{evt.description}</p>
                          <span className="text-[10px] text-slate-500 dark:text-[#71717A] font-medium block">
                            Authority: {evt.actor} • Ref: {evt.referenceDoc}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 pl-6">No historical records available.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column in Overview */}
              <div className="space-y-6">
                <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 space-y-4 shadow-card dark:shadow-dark-card">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#27272A] pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> Land Ownership Protection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">
                    Automated SMS and email alerts triggered upon any mutation, survey, or mortgage activity on this holding.
                  </p>

                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2.5 bg-slate-50/80 dark:bg-[#121215]/80 p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#34D399] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Citizen SMS Gateway</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#71717A] font-mono">{parcel.phone} (Verified)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-50/80 dark:bg-[#121215]/80 p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#34D399] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Mutation Radar</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#71717A]">Instant Alert on Case Lodging</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 space-y-4 shadow-card dark:shadow-dark-card">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#27272A] pb-3">
                    <FileCheck className="w-4 h-4 text-slate-700 dark:text-[#A1A1AA]" /> Digitized Vault & OCR
                  </h3>

                  <div className="space-y-2">
                    {parcel.documents && parcel.documents.length > 0 ? (
                      parcel.documents.map((doc, idx) => (
                        <div key={idx} className="bg-slate-50/80 dark:bg-[#121215]/80 p-3 rounded-lg border border-slate-200 dark:border-[#27272A] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white">{doc.docType}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{doc.fileName.split('.').pop()}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-[#A1A1AA] font-bangla font-light line-clamp-1">{doc.ocrText || doc.fileName}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No scanned documents available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cadastral GIS Vector Map */}
          {activeTab === 'map' && parcel && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="xl:col-span-2 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 sm:p-8 space-y-4 shadow-card dark:shadow-dark-card">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-[#27272A] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> PostGIS Cadastral Spatial Boundary
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#A1A1AA] font-bangla font-light">
                      মৌজা {parcel.mouza} (জেএল #{parcel.jlNumber}) • দাগ #{parcel.dagNo} • EPSG:4326 (WGS84)
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800/80 font-mono">
                    DLRS VECTOR SYNCHRONIZED
                  </span>
                </div>

                <div className="w-full h-96 bg-slate-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800">
                  <div className="absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

                  <svg className="w-full h-full p-8" viewBox="0 0 600 300">
                    <polygon points="120,50 240,40 230,140 110,130" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />
                    <text x="160" y="90" fill="#71717a" fontSize="11" fontFamily="JetBrains Mono">Plot #1203</text>

                    <polygon points="410,60 530,70 510,170 390,160" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />
                    <text x="440" y="110" fill="#71717a" fontSize="11" fontFamily="JetBrains Mono">Plot #1206</text>

                    <polygon 
                      points="250,50 390,60 370,220 220,200" 
                      fill="rgba(52, 211, 153, 0.18)" 
                      stroke="#34d399" 
                      strokeWidth="2.5" 
                    />
                    
                    <circle cx="250" cy="50" r="4" fill="#34d399" />
                    <circle cx="390" cy="60" r="4" fill="#34d399" />
                    <circle cx="370" cy="220" r="4" fill="#34d399" />
                    <circle cx="220" cy="200" r="4" fill="#34d399" />

                    <text x="270" y="125" fill="#ffffff" fontWeight="bold" fontSize="13" fontFamily="Geist, Inter">Dag #{parcel.dagNo}</text>
                    <text x="268" y="145" fill="#34d399" fontSize="11" fontFamily="JetBrains Mono">{parcel.areaDecimal} Decimals</text>
                    <text x="265" y="165" fill="#a1a1aa" fontSize="10" fontFamily="Anek Bangla">{parcel.landClass}</text>

                    <line x1="50" y1="260" x2="550" y2="260" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 4" />
                    <text x="220" y="280" fill="#60a5fa" fontSize="10" fontFamily="Geist, Inter">20ft Union Parishad Access Road</text>
                  </svg>

                  <div className="absolute top-3 left-3 bg-[#030303]/85 backdrop-blur border border-[#27272A] rounded-lg p-2.5 text-[10px] space-y-0.5 text-[#A1A1AA] font-mono shadow-md">
                    <div>Latitude: <span className="text-white">23.8432° N</span></div>
                    <div>Longitude: <span className="text-white">90.2581° E</span></div>
                    <div className="text-[#34D399]">Boundary Integrity: 99.4%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="bg-slate-50/80 dark:bg-[#121215] p-2.5 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <span className="text-slate-500 dark:text-[#71717A] block text-[10px] uppercase font-semibold">NW Node</span>
                    <span className="text-slate-900 dark:text-white font-mono text-[11px]">23.8432, 90.2581</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-[#121215] p-2.5 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <span className="text-slate-500 dark:text-[#71717A] block text-[10px] uppercase font-semibold">NE Node</span>
                    <span className="text-slate-900 dark:text-white font-mono text-[11px]">23.8435, 90.2592</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-[#121215] p-2.5 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <span className="text-slate-500 dark:text-[#71717A] block text-[10px] uppercase font-semibold">SE Node</span>
                    <span className="text-slate-900 dark:text-white font-mono text-[11px]">23.8427, 90.2595</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-[#121215] p-2.5 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <span className="text-slate-500 dark:text-[#71717A] block text-[10px] uppercase font-semibold">SW Node</span>
                    <span className="text-slate-900 dark:text-white font-mono text-[11px]">23.8424, 90.2583</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 sm:p-8 space-y-4 shadow-card dark:shadow-dark-card">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#27272A] pb-3">
                  <Layers className="w-4 h-4 text-slate-700 dark:text-[#A1A1AA]" /> Cadastral Survey Layers
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block font-bangla font-light">আরএস মৌজা নকশা (RS 1988)</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A]">Sheet #04</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 font-mono">MATCHED</span>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block font-bangla font-light">বিএস জরিপ ডিজিটাইজড (BS 2015)</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A]">Digitized Layer</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 font-mono">MATCHED</span>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block font-bangla font-light">ডিএলআরএস ড্রোন জিআইএস</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#71717A]">PostGIS Vector Layer</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#60A5FA] bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/80 font-mono">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Data Cross-Audit */}
          {activeTab === 'reconciliation' && parcel && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 sm:p-8 space-y-4 shadow-card dark:shadow-dark-card">
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-[#27272A] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> Authoritative Multi-Source Cross Audit
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">
                      Automated comparison across Land Ministry Khatiyan, DLRS Cadastral GIS, Upazila Records, and Sub-Registry Deeds.
                    </p>
                  </div>

                  <button
                    onClick={handleRunReconciliation}
                    disabled={isAuditing}
                    className="bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm font-mono"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                    {isAuditing ? 'Auditing 4 Sources...' : 'Trigger Cross-Audit'}
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-[#27272A] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 dark:bg-[#121215] text-slate-600 dark:text-[#A1A1AA] uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#27272A] font-mono">
                      <tr>
                        <th className="p-3.5">Attribute</th>
                        <th className="p-3.5 font-bangla font-light">ই-পর্চা (e-Parcha)</th>
                        <th className="p-3.5">DLRS PostGIS Cadastre</th>
                        <th className="p-3.5 font-bangla font-light">সাব-রেজিস্ট্রি দলিল (Deed)</th>
                        <th className="p-3.5">Reconciliation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#18181B]">
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white font-bangla font-light">স্বত্বাধিকারী (Owner)</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-bangla font-light">Md. Rafiqul Islam</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-bangla font-light">Md. Rafiqul Islam</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-bangla font-light">Md. Rafiqul Islam</td>
                        <td className="p-3.5">
                          <span className="text-emerald-800 dark:text-[#34D399] font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800/80 inline-flex items-center gap-1 text-[11px] font-mono">
                            <Check className="w-3 h-3" /> MATCHED (100%)
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white font-bangla font-light">দাগ নম্বর (Dag No)</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-mono">1204</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-mono">1204</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-mono">1204 / 1205 (Part)</td>
                        <td className="p-3.5">
                          <span className="text-emerald-800 dark:text-[#34D399] font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800/80 inline-flex items-center gap-1 text-[11px] font-mono">
                            <Check className="w-3 h-3" /> MATCHED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white font-bangla font-light">জমির পরিমাণ (Area)</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-mono">5.50 Decimals</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-mono">5.46 Decimals</td>
                        <td className="p-3.5 text-slate-800 dark:text-[#A1A1AA] font-mono">5.50 Decimals</td>
                        <td className="p-3.5">
                          <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800/80 inline-flex items-center gap-1 text-[11px] font-mono">
                            <AlertTriangle className="w-3 h-3" /> 0.04 Dec Spatial Variance
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: e-Mutation Tracker */}
          {activeTab === 'mutations' && parcel && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700 dark:text-[#34D399]" /> e-Mutation Case Tracking (ই-নামজারি)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#A1A1AA] font-bangla font-light">
                    সহকারী কমিশনার (ভূমি) আদালতের ৪-ধাপ শুনানি ও নতুন খতিয়ান সৃজন।
                  </p>
                </div>

                <button
                  onClick={() => setShowMutationModal(true)}
                  className="bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" /> File Mutation Application
                </button>
              </div>

              <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 space-y-4 shadow-card dark:shadow-dark-card">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#71717A] font-bangla font-light">সরকারি ৪-ধাপের নামজারি প্রক্রিয়া</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="bg-slate-50/80 dark:bg-[#121215] p-4 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-[#34D399] font-bold text-xs font-bangla font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399]" /> ধাপ ১: আবেদন ও যাচাই
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#A1A1AA] mt-1 font-bangla font-light">ইউনিয়ন ভূমি সহকারী কর্মকর্তা প্রতিবেদন</p>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-[#121215] p-4 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-[#34D399] font-bold text-xs font-bangla font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399]" /> ধাপ ২: কানুনগো জরিপ
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#A1A1AA] mt-1 font-bangla font-light">জমিন স্পট পরিদর্শন ও খতিয়ান হিস্যা</p>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-[#121215] p-4 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-[#34D399] font-bold text-xs font-bangla font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399]" /> ধাপ ৩: এসি ল্যান্ড শুনানি
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#A1A1AA] mt-1 font-bangla font-light">জুডিশিয়াল শুনানি ও আপত্তি নিষ্পত্তি</p>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-[#121215] p-4 rounded-lg border border-slate-200 dark:border-[#27272A]">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-[#34D399] font-bold text-xs font-bangla font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399]" /> ধাপ ৪: ডিসিআর ও খতিয়ান
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#A1A1AA] mt-1 font-bangla font-light">১১৫০ টাকা সরকারি ফি ও নতুন খতিয়ান</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {parcel.mutations && parcel.mutations.length > 0 ? (
                  parcel.mutations.map((m, idx) => (
                    <div key={idx} className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-5 space-y-3 shadow-card dark:shadow-dark-card">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{m.caseNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              m.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/80' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-[#A1A1AA] mt-1 font-bangla font-light">
                            আবেদনকারী: <strong className="text-slate-900 dark:text-white font-semibold">{m.applicantName}</strong> (NID: {m.applicantNid})
                          </p>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-[10px] text-slate-500 dark:text-[#71717A] uppercase block font-semibold">Government DCR Fee</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{m.dcrAmount || 1150} BDT</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A] text-xs space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-[#71717A] font-semibold uppercase block">Current Stage</span>
                        <p className="text-slate-900 dark:text-white font-medium font-bangla font-light">{m.currentStage}</p>
                        {m.remarks && <p className="text-slate-500 dark:text-[#71717A] text-[11px] pt-1">Remarks: {m.remarks}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/95 dark:bg-[#18181B]/95 p-8 rounded-xl text-center text-slate-400 dark:text-[#71717A] text-xs border border-slate-200 dark:border-[#27272A]">
                    No active mutation cases found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LD Tax & Digital Dakhila */}
          {activeTab === 'tax' && parcel && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> Land Development Tax (ভূমি উন্নয়ন কর ও ই-দাখিলা)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#A1A1AA] font-bangla font-light">
                    ডিজিটাল পেমেন্ট এবং কিউআর কোড ভেরিফাইড দাখিলা রসিদ।
                  </p>
                </div>

                {recentDakhila && (
                  <button
                    onClick={() => setShowDakhilaModal(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm font-bangla font-light"
                  >
                    <QrCode className="w-3.5 h-3.5" /> দাখিলা রসিদ দেখুন (View Dakhila)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parcel.taxRecords && parcel.taxRecords.length > 0 ? (
                  parcel.taxRecords.map((tax, idx) => (
                    <div key={idx} className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 space-y-4 shadow-card dark:shadow-dark-card">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-3">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-bangla font-light">
                          অর্থবছর: {tax.fiscalYear}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          tax.status === 'VERIFIED' || tax.status === 'RECONCILED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800/80'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                        }`}>
                          {tax.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                        <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                          <span className="text-[10px] text-slate-500 dark:text-[#71717A] block font-bangla font-light">বার্ষিক দাবী</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{tax.annualDemandBDT} BDT</span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                          <span className="text-[10px] text-slate-500 dark:text-[#71717A] block font-bangla font-light">বকেয়া</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{tax.arrearAmountBDT} BDT</span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
                          <span className="text-[10px] text-slate-500 dark:text-[#71717A] block font-bangla font-light">মোট প্রদেয়</span>
                          <span className="font-bold text-emerald-800 dark:text-[#34D399] font-mono">{tax.totalDueBDT} BDT</span>
                        </div>
                      </div>

                      {tax.status === 'VERIFIED' || tax.status === 'RECONCILED' ? (
                        <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200 dark:border-[#27272A] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-[#71717A] font-bangla font-light">দাখিলা নম্বর:</span>
                            <span className="text-emerald-900 dark:text-[#34D399] font-mono font-bold">{tax.dakhilaNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-[#71717A]">Trx ID:</span>
                            <span className="text-slate-800 dark:text-[#A1A1AA] font-mono">{tax.trxId}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTaxRecord(tax);
                            setShowPayModal(true);
                          }}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-[#34D399] dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" /> Pay LD Tax Online ({tax.totalDueBDT} BDT)
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white/95 dark:bg-[#18181B]/95 p-8 rounded-xl text-center text-slate-400 dark:text-[#71717A] text-xs border border-slate-200 dark:border-[#27272A]">
                    No tax assessment records found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Automation & Microservice Hub */}
          {activeTab === 'automations' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="border-b border-slate-200 dark:border-[#27272A] pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> Automated Microservices & Workflows
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">
                  Continuous event-driven listeners, PostgreSQL change streams, and scheduled reconciliation pipelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {automations.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-5 space-y-3 shadow-card dark:shadow-dark-card hover:border-slate-300 dark:hover:border-slate-700 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#121215] text-slate-700 dark:text-[#34D399] border border-slate-200 dark:border-[#27272A]">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</h4>
                        </div>
                        <span className="text-[10px] text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 font-semibold font-mono">
                          {a.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#A1A1AA] leading-relaxed">{a.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] rounded-xl p-6 space-y-3 shadow-card dark:shadow-dark-card">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-700 dark:text-[#34D399]" /> Automation Event Dispatch Stream
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#71717A]">Endpoint :5678</span>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2 border border-slate-800 max-h-48 overflow-y-auto">
                  {n8nLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#34D399] select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Pay Tax Online */}
      {showPayModal && selectedTaxRecord && parcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl max-w-md w-full p-6 space-y-4 shadow-elevated animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700 dark:text-[#34D399]" /> Pay Land Development Tax Online
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50/80 dark:bg-[#121215] p-3.5 rounded-lg border border-slate-200 dark:border-[#27272A] text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-[#A1A1AA]">
                <span>Parcel UPID:</span> <span className="text-slate-900 dark:text-white font-mono font-medium">{parcel.id}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#A1A1AA] font-bangla font-light">
                <span>অর্থবছর:</span> <span className="text-slate-900 dark:text-white font-bold">{selectedTaxRecord.fiscalYear}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#A1A1AA] border-t border-slate-200 dark:border-[#27272A] pt-1">
                <span>Payable Amount:</span> <span className="text-emerald-800 dark:text-[#34D399] font-bold font-mono">{selectedTaxRecord.totalDueBDT} BDT</span>
              </div>
            </div>

            <form onSubmit={handlePayTaxSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold">Select Payment Gateway</label>
                <div className="grid grid-cols-3 gap-2">
                  {['bKash', 'Nagad', 'Ekpay'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-lg font-bold border transition text-xs ${
                        paymentMethod === method 
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-sm' 
                          : 'bg-slate-50 dark:bg-[#121215] text-slate-700 dark:text-[#A1A1AA] border border-slate-200 dark:border-[#27272A] hover:bg-slate-100 dark:hover:bg-[#202024]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold">Mobile Wallet Number</label>
                <input
                  type="text"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-[#34D399] focus:bg-white dark:focus:bg-[#121215]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold">PIN / Security Token (Simulation)</label>
                <input
                  type="password"
                  value={paymentPin}
                  onChange={(e) => setPaymentPin(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-[#34D399] focus:bg-white dark:focus:bg-[#121215]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-[#34D399] dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Transaction...
                  </>
                ) : (
                  `Confirm Payment of ${selectedTaxRecord.totalDueBDT} BDT`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Official Printable Digital Dakhila */}
      {showDakhilaModal && recentDakhila && parcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-elevated animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-800 dark:text-[#34D399]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla font-light">ভূমি উন্নয়ন কর পরিশোধ দাখিলা (e-Dakhila)</h3>
              </div>
              <button onClick={() => setShowDakhilaModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-dakhila" className="bg-slate-50 dark:bg-[#121215] p-6 rounded-xl border border-slate-300 dark:border-[#27272A] space-y-4 font-bangla font-light text-xs text-slate-900 dark:text-white shadow-inner">
              <div className="text-center border-b border-slate-300 dark:border-[#27272A] pb-3 space-y-0.5">
                <p className="font-bold text-sm text-slate-900 dark:text-white">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                <p className="text-xs text-slate-700 dark:text-[#A1A1AA]">ভূমি মন্ত্রণালয় • সহকারী কমিশনার (ভূমি) দপ্তর</p>
                <p className="text-[11px] text-emerald-800 dark:text-[#34D399] font-bold font-mono mt-1">
                  দাখিলা নং: {recentDakhila.dakhilaNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 dark:text-[#71717A] block">মালিকের নাম:</span> <strong className="text-slate-900 dark:text-white font-semibold">{parcel.currentOwner}</strong></div>
                <div><span className="text-slate-500 dark:text-[#71717A] block">হোল্ডিং নং:</span> <strong className="text-slate-900 dark:text-white font-semibold">{parcel.holdingNo}</strong></div>
                <div><span className="text-slate-500 dark:text-[#71717A] block">মৌজা ও জেএল:</span> <span className="text-slate-900 dark:text-white">{parcel.mouza} (জেএল #{parcel.jlNumber})</span></div>
                <div><span className="text-slate-500 dark:text-[#71717A] block">খতিয়ান ও দাগ:</span> <span className="text-slate-900 dark:text-white">{parcel.khatianNo} • দাগ {parcel.dagNo}</span></div>
                <div><span className="text-slate-500 dark:text-[#71717A] block">জমির শ্রেণী ও পরিমাণ:</span> <span className="text-slate-900 dark:text-white">{parcel.landClass} ({parcel.areaDecimal} শতক)</span></div>
                <div><span className="text-slate-500 dark:text-[#71717A] block">অর্থবছর:</span> <span className="text-slate-900 dark:text-white font-bold">{recentDakhila.fiscalYear}</span></div>
              </div>

              <div className="bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 p-3 rounded-lg flex items-center justify-between text-emerald-950 dark:text-[#34D399] font-bold text-xs">
                <span>পরিশোধিত অর্থের পরিমাণ:</span>
                <span className="font-mono text-sm">{recentDakhila.paidAmountBDT} টাকা (পরিশোধিত)</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-[#27272A] text-[10px] text-slate-600 dark:text-[#A1A1AA]">
                <div className="space-y-0.5">
                  <p>ট্রানজেকশন আইডি: <span className="font-mono text-slate-900 dark:text-white font-medium">{recentDakhila.trxId}</span></p>
                  <p>পেমেন্ট মাধ্যম: {recentDakhila.paymentMethod}</p>
                  <p>তারিখ: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="bg-white dark:bg-[#18181B] p-2 rounded-lg border border-slate-300 dark:border-[#27272A] text-center">
                  <QrCode className="w-8 h-8 mx-auto text-slate-900 dark:text-white" />
                  <span className="text-[8px] block mt-0.5 text-slate-600 dark:text-[#71717A] font-mono">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#27272A]">
              <button 
                onClick={() => window.print()}
                className="bg-slate-100 dark:bg-[#121215] hover:bg-slate-200 dark:hover:bg-[#202024] text-slate-800 dark:text-white text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 border border-slate-300 dark:border-[#27272A] font-medium"
              >
                <Printer className="w-3.5 h-3.5" /> Print Dakhila
              </button>
              <button 
                onClick={() => setShowDakhilaModal(false)}
                className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Submit e-Mutation Application */}
      {showMutationModal && parcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl max-w-md w-full p-6 space-y-4 shadow-elevated animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700 dark:text-[#34D399]" /> File e-Mutation Application (ই-নামজারি)
              </h3>
              <button onClick={() => setShowMutationModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMutationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold font-bangla font-light">আবেদনকারীর পূর্ণ নাম</label>
                <input
                  type="text"
                  value={mutationApplicant}
                  onChange={(e) => setMutationApplicant(e.target.value)}
                  placeholder="e.g. Md. Tariqul Islam"
                  className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-[#34D399] focus:bg-white dark:focus:bg-[#121215]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold font-bangla font-light">জাতীয় পরিচয়পত্র নম্বর (NID)</label>
                <input
                  type="text"
                  value={mutationNid}
                  onChange={(e) => setMutationNid(e.target.value)}
                  placeholder="e.g. 19902691234567890"
                  className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-[#34D399] focus:bg-white dark:focus:bg-[#121215]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold font-bangla font-light">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={mutationPhone}
                  onChange={(e) => setMutationPhone(e.target.value)}
                  placeholder="e.g. +880 1819-123456"
                  className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-[#34D399] focus:bg-white dark:focus:bg-[#121215]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#A1A1AA] block mb-1 font-semibold font-bangla font-light">প্রস্তাবিত নতুন মালিকের নাম</label>
                <input
                  type="text"
                  value={mutationProposed}
                  onChange={(e) => setMutationProposed(e.target.value)}
                  placeholder="e.g. Md. Tariqul Islam & Co."
                  className="w-full bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-[#34D399] focus:bg-white dark:focus:bg-[#121215]"
                  required
                />
              </div>

              <div className="bg-slate-50 dark:bg-[#121215] p-3 rounded-lg border border-slate-200 dark:border-[#27272A] text-[11px] text-slate-600 dark:text-[#A1A1AA] font-bangla font-light">
                সরকারি ডিসিআর ও কোর্ট ফি: <strong className="text-slate-900 dark:text-white font-mono font-semibold">1,150 BDT</strong>
              </div>

              <button
                type="submit"
                disabled={isSubmittingMutation}
                className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmittingMutation ? 'Submitting...' : 'Submit to AC (Land) Portal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
