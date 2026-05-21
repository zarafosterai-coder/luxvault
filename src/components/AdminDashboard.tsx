import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink, 
  Database, 
  AlertTriangle, 
  LogOut, 
  PlusCircle, 
  Lock, 
  UserCircle,
  TrendingUp,
  Award,
  Users,
  Search,
  Filter,
  Check,
  Twitter,
  Calendar,
  Layers,
  Sparkles,
  Link,
  ChevronRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  signInWithGoogleSheets, 
  signLogout, 
  initSheetsAuth, 
  getSheetsAccessToken, 
  createAdminSpreadsheet, 
  setupSpreadsheetHeaders, 
  writeRowsToSpreadsheet 
} from "../lib/googleSheets";
import { apiClient, WLSubmission } from "../lib/apiClient";

// Sibling sub-components for the Live WordPress-like CMS GUI Viewport
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { WLStages } from "./WLStages";
import { WLChecker } from "./WLChecker";
import { LiveStats } from "./LiveStats";
import { PreviewSection } from "./PreviewSection";
import { Footer } from "./Footer";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("luxvault_admin_auth") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Spreadsheet management state
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem("luxvault_admin_sheet_id") || "";
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem("luxvault_admin_sheet_url") || "";
  });

  const [submissions, setSubmissions] = useState<WLSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);

  // Campaign Config dynamic state
  const [campaignConfig, setCampaignConfig] = useState({
    targetPostUrl: "https://x.com/LuxVault_/status/2054056009291980861?s=20",
    targetAccount: "LuxVault_",
    requiredText: "@LuxVault_",
    totalSupply: "1111",
    mintPrice: "Free Mint"
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveStatus, setConfigSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [configSaveMessage, setConfigSaveMessage] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Selected sub for detail overlay
  const [selectedSubmission, setSelectedSubmission] = useState<WLSubmission | null>(null);

  // CMS state for visual WordPress-like drag and drop editor
  const [activeTab, setActiveTab] = useState<"database" | "cms">("database");
  const [cmsLayout, setCmsLayout] = useState<any[]>([]);
  const [isCmsLoading, setIsCmsLoading] = useState(false);
  const [cmsSaveStatus, setCmsSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [cmsMessage, setCmsMessage] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string>("hero");

  // Initialize Auth state for Google sheets
  useEffect(() => {
    const unsubscribe = initSheetsAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setConfigError(null);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123" || passcode === "luxvault2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("luxvault_admin_auth", "true");
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid security pin. Access Denied.");
    }
  };

  // Fetch submissions from DB / localStorage
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const data = await apiClient.getAllSubmissions();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (err: any) {
      console.error("Failed to load submissions:", err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const loadCampaignConfig = async () => {
    try {
      const data = await apiClient.getCampaignConfig();
      if (data) {
        setCampaignConfig({
          targetPostUrl: data.targetPostUrl || "https://x.com/LuxVault_/status/2054056009291980861?s=20",
          targetAccount: data.targetAccount || "LuxVault_",
          requiredText: data.requiredText || "@LuxVault_",
          totalSupply: data.totalSupply || "1111",
          mintPrice: data.mintPrice || "Free Mint"
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch campaign config in dashboard:", err);
    }
  };

  const handleSaveCampaignConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSaveStatus("idle");
    try {
      const res = await apiClient.saveCampaignConfig(campaignConfig);
      if (res.success) {
        setConfigSaveStatus("success");
        setTimeout(() => setConfigSaveStatus("idle"), 3000);
      } else {
        throw new Error("Unspecified save error");
      }
    } catch (err: any) {
      setConfigSaveStatus("error");
      setConfigSaveMessage(err.message || "Failed saving live settings");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleGlobalReset = async () => {
    const confirmation = window.confirm(
      "CRITICAL SECURITY PROMPT:\n\nAre you absolutely sure you want to PURGE ALL whitelisting user registrations inside the database?\n\nThis will permanently delete all task history and user submissions and cannot be undone."
    );
    if (!confirmation) return;

    try {
      const res = await apiClient.resetAllSubmissions();
      if (res.success) {
        alert(res.message);
        fetchSubmissions();
      }
    } catch (err: any) {
      alert("Reset all failed: " + err.message);
    }
  };

  const handleDeleteSingleSubmission = async (walletAddress: string) => {
    const confirmation = window.confirm(
      `Are you sure you want to RESET/DELETE registration for user "${walletAddress}"?\n\nThis deletes their whitelisting entries and allows them to sign up again.`
    );
    if (!confirmation) return;

    try {
      const res = await apiClient.deleteSubmission(walletAddress);
      if (res.success) {
        alert(res.message);
        setSelectedSubmission(null);
        fetchSubmissions();
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const fetchCMSLayout = async () => {
    setIsCmsLoading(true);
    try {
      const data = await apiClient.getCMSLayout();
      if (Array.isArray(data) && data.length > 0) {
        setCmsLayout(data);
      }
    } catch (err: any) {
      console.error("Failed to load layout in admin panel:", err);
    } finally {
      setIsCmsLoading(false);
    }
  };

  const handlePublishCMS = async () => {
    setCmsSaveStatus("saving");
    try {
      const res = await apiClient.saveCMSLayout(cmsLayout);
      if (res.success) {
        setCmsSaveStatus("saved");
        setCmsMessage(res.message || "Page updated successfully!");
        setTimeout(() => setCmsSaveStatus("idle"), 4000);
      } else {
        throw new Error("API failed to save layout.");
      }
    } catch (err: any) {
      setCmsSaveStatus("error");
      setCmsMessage(err.message || "Failed to update layout");
      setTimeout(() => setCmsSaveStatus("idle"), 4000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
      loadCampaignConfig();
      fetchCMSLayout();
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    try {
      setConfigError(null);
      const res = await signInWithGoogleSheets();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setSyncStatus("idle");
      }
    } catch (err: any) {
      console.error("Google Auth failed detailed error:", err);
      if (err.code === "auth/unauthorized-domain") {
        setConfigError(
          "UNAUTHORIZED DOMAIN: This domain ('luxvault-dusky.vercel.app') is not added to your Firebase Authorized Domains list. Please add it in your Firebase Console under 'Authentication' -> 'Settings' -> 'Authorized domains'."
        );
      } else if (err.code === "auth/operation-not-allowed") {
        setConfigError(
          "OPERATION NOT ALLOWED: 'Google' provider is not enabled in Firebase. Please enable 'Google' inside Firebase Console -> Authentication -> Sign-in method."
        );
      } else if (err.code === "auth/popup-blocked") {
        setConfigError(
          "POPUP BLOCKED: Google authentication window was blocked. Please enable modal popups in your browser settings for this page."
        );
      } else {
        setConfigError(`Connection Error: ${err.message || "Failed to establish popup channel."}`);
      }
    }
  };

  const handleGoogleLogout = async () => {
    await signLogout();
    setGoogleUser(null);
    setAccessToken(null);
  };

  const handleCreateSpreadsheet = async () => {
    const token = accessToken || getSheetsAccessToken();
    if (!token) {
      alert("Please sign in with Google first.");
      return;
    }

    try {
      setSyncStatus("idle");
      setStatusMessage("Creating Google Spreadsheet...");
      setIsExporting(true);

      const result = await createAdminSpreadsheet(token, "LuxVault Private Whitelist Campaigns");
      setSpreadsheetId(result.spreadsheetId);
      setSpreadsheetUrl(result.spreadsheetUrl);
      localStorage.setItem("luxvault_admin_sheet_id", result.spreadsheetId);
      localStorage.setItem("luxvault_admin_sheet_url", result.spreadsheetUrl);

      setStatusMessage("Spreadsheet created! Initializing custom column headers...");
      await setupSpreadsheetHeaders(token, result.spreadsheetId);

      setSyncStatus("success");
      setStatusMessage("Successfully created brand new Spreadsheet!");
    } catch (err: any) {
      console.error(err);
      setSyncStatus("error");
      setStatusMessage(`Error creating sheet: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncToSheets = async () => {
    const token = accessToken || getSheetsAccessToken();
    if (!token) {
      alert("Please connect Google Sheets first.");
      return;
    }
    if (!spreadsheetId) {
      alert("Please create or enter a Spreadsheet ID first.");
      return;
    }

    try {
      setSyncStatus("idle");
      setStatusMessage("Preparing campaign responses...");
      setIsExporting(true);

      // Refresh records first
      const data = await apiClient.getAllSubmissions();
      const currentSubmissions = data.success ? data.submissions : submissions;
      setSubmissions(currentSubmissions);

      if (currentSubmissions.length === 0) {
        setSyncStatus("error");
        setStatusMessage("No submissions found to export.");
        setIsExporting(false);
        return;
      }

      const rows = currentSubmissions.map((sub) => {
        let fcfs = sub.walletAddress || "";
        let wl = "";
        let gtd = "";

        if (sub.savedWalletAddress) {
          try {
            const parsedWallets = JSON.parse(sub.savedWalletAddress);
            fcfs = parsedWallets.fcfs || fcfs;
            wl = parsedWallets.wl || "";
            gtd = parsedWallets.gtd || "";
          } catch (e) {
            fcfs = sub.savedWalletAddress || fcfs;
          }
        }

        return [
          sub.walletAddress || "N/A",
          sub.twitterUsername || "N/A",
          sub.inviteLink || "N/A",
          sub.artLink || "N/A",
          sub.quoteTweetUrl || "N/A",
          sub.commentUrl || "N/A",
          fcfs || "N/A",
          wl || "N/A",
          gtd || "N/A",
          new Date(sub.createdAt || Date.now()).toLocaleDateString() + " " + new Date(sub.createdAt || Date.now()).toLocaleTimeString(),
        ];
      });

      setStatusMessage(`Syncing ${rows.length} rows to Google Sheet...`);
      await writeRowsToSpreadsheet(token, spreadsheetId, rows);

      setSyncStatus("success");
      setStatusMessage(`Exported ${rows.length} campaigns responses successfully!`);
    } catch (err: any) {
      console.error(err);
      setSyncStatus("error");
      setStatusMessage(`Sync failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper parsing wallet tiers for stats & charts
  const getParsedWallets = (sub: WLSubmission) => {
    let fcfs = sub.walletAddress || "";
    let wl = "";
    let gtd = "";

    if (sub.savedWalletAddress) {
      try {
        const parsedWallets = JSON.parse(sub.savedWalletAddress);
        fcfs = parsedWallets.fcfs || fcfs;
        wl = parsedWallets.wl || "";
        gtd = parsedWallets.gtd || "";
      } catch (e) {
        fcfs = sub.savedWalletAddress || fcfs;
      }
    }
    return { fcfs, wl, gtd };
  };

  // Analyze submissions for charts
  const totalEntries = submissions.length;
  const withTwitterCount = submissions.filter(s => s.twitterUsername).length;
  const withArtCount = submissions.filter(s => s.artLink).length;
  const withQuoteCount = submissions.filter(s => s.quoteTweetUrl).length;

  let fcfsRegisteredCount = 0;
  let wlRegisteredCount = 0;
  let gtdRegisteredCount = 0;

  submissions.forEach(sub => {
    const { fcfs, wl, gtd } = getParsedWallets(sub);
    if (fcfs) fcfsRegisteredCount++;
    if (wl) wlRegisteredCount++;
    if (gtd) gtdRegisteredCount++;
  });

  // Recharts Area dataset format: Registration Growth by Day
  const getTimelineData = () => {
    const dailyMap: { [key: string]: number } = {};
    submissions.forEach(sub => {
      const dateStr = new Date(sub.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
    });

    // Make sorted list
    return Object.entries(dailyMap).map(([date, count]) => ({
      date,
      Registrations: count,
    })).reverse(); // Oldest to newest
  };

  const timelineData = getTimelineData();

  // Recharts Pie dataset format: Tier allocation
  const pieData = [
    { name: "Super FCFS Spot", value: fcfsRegisteredCount, color: "#10b981" },
    { name: "Guaranteed GTD Spot", value: gtdRegisteredCount, color: "#f59e0b" },
    { name: "Standard Whitelist", value: wlRegisteredCount, color: "#3b82f6" },
  ];

  // Filter submissions list
  const filteredSubmissions = submissions.filter(sub => {
    const { fcfs, wl, gtd } = getParsedWallets(sub);
    const searchLower = searchQuery.toLowerCase();
    const addressMatch = 
      (sub.walletAddress || "").toLowerCase().includes(searchLower) ||
      (fcfs || "").toLowerCase().includes(searchLower) ||
      (wl || "").toLowerCase().includes(searchLower) ||
      (gtd || "").toLowerCase().includes(searchLower);

    const twitterMatch = (sub.twitterUsername || "").toLowerCase().includes(searchLower);
    const inviteMatch = (sub.inviteLink || "").toLowerCase().includes(searchLower);

    const matchesSearch = addressMatch || twitterMatch || inviteMatch;

    if (tierFilter === "fcfs") return matchesSearch && !!fcfs;
    if (tierFilter === "wl") return matchesSearch && !!wl;
    if (tierFilter === "gtd") return matchesSearch && !!gtd;
    return matchesSearch;
  });

  // Lockscreen view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b0d] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d1518]/90 border border-brand-border/40 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-amber-500"></div>
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-2">
              <Lock size={26} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase font-mono">
              Campaign Admin Access Only
            </h2>
            <p className="text-xs text-brand-muted/80 max-w-sm">
              Authenticating console credential keys. Enter campaign private passkey to view user responses.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-widest font-mono mb-2">
                Security Authorization Code
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center tracking-widest bg-black/40 border border-brand-border/60 hover:border-brand-border rounded px-4 py-3.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
              {passcodeError && (
                <p className="text-red-400 text-[10px] font-mono mt-1.5 text-center">
                  ⚠️ {passcodeError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light py-3 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Verify Security Key
            </button>
          </form>

          <div className="pt-2 text-center border-t border-brand-border/30">
            <a 
              href="/" 
              className="text-[11px] text-teal-400 font-mono tracking-wide hover:underline inline-flex items-center gap-1"
            >
              Return to main platform
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a0c] text-[#f1f5f9] font-sans pb-16 flex flex-col">
      
      {/* Top Banner / Header */}
      <nav className="bg-[#0b1013] border-b border-brand-border/40 px-6 py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2 rounded-sm text-brand-bg-light shadow-md shadow-teal-900/40">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  Campaign Executive
                </span>
                <span className="text-xs text-brand-muted font-mono select-none">/ v2.5.0-SECURE</span>
              </div>
              <h1 className="text-lg font-serif font-bold text-white tracking-tight uppercase">
                LuxVault Campaign Admin Console
              </h1>
            </div>
          </div>

          {/* Quick Info & Log Out */}
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="/"
              className="text-xs font-mono text-brand-muted hover:text-white border border-brand-border/40 px-3 py-2 bg-black/20 hover:bg-black/40 rounded transition-colors"
            >
              Main Platform ↗
            </a>

            <button 
              onClick={() => {
                sessionStorage.removeItem("luxvault_admin_auth");
                setIsAuthenticated(false);
              }}
              className="cursor-pointer text-xs font-mono text-red-400 hover:text-red-300 border border-red-900/40 px-3 py-2 bg-red-950/20 hover:bg-red-950/40 rounded transition-all inline-flex items-center gap-1.5"
            >
              <LogOut size={13} />
              Lock Session
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8 w-full">
        
        {/* Premium tab switcher layout */}
        <div className="flex border-b border-brand-border/30 pb-px gap-2">
          <button
            onClick={() => setActiveTab("database")}
            className={`cursor-pointer px-5 py-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "database"
                ? "border-teal-500 text-teal-400 bg-teal-500/5 font-bold"
                : "border-transparent text-brand-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Database size={13} />
            Database & Analytics
          </button>
          
          <button
            onClick={() => setActiveTab("cms")}
            className={`cursor-pointer px-5 py-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "cms"
                ? "border-amber-500 text-amber-400 bg-amber-500/5 font-bold"
                : "border-transparent text-brand-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles size={13} className="animate-pulse text-amber-400" />
            WordPress Drag-N-Drop Visual CMS
          </button>
        </div>

        {activeTab === "database" ? (
          <>
            {/* Statistics Widgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#0c1215] border border-brand-border/30 rounded p-5 relative overflow-hidden flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded text-teal-400 border border-teal-500/20">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Total Registered Campaigns</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalEntries}</h3>
              <p className="text-[10px] text-teal-400 font-mono mt-0.5">// 100% On-chain active list</p>
            </div>
            <div className="absolute right-2 bottom-2 text-teal-500/5 select-none font-mono text-6xl font-bold">#</div>
          </div>

          <div className="bg-[#0c1215] border border-brand-border/30 rounded p-5 relative overflow-hidden flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded text-amber-500 border border-amber-500/20">
              <Twitter size={22} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Verified Twitter Users</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {withTwitterCount} <span className="text-xs text-brand-muted">({totalEntries ? Math.round((withTwitterCount / totalEntries) * 100) : 0}%)</span>
              </h3>
              <p className="text-[10px] text-amber-500 font-mono mt-0.5">// Scrapped via Twitter proxy</p>
            </div>
            <div className="absolute right-2 bottom-2 text-amber-500/5 select-none font-mono text-6xl font-bold">@</div>
          </div>

          <div className="bg-[#0c1215] border border-brand-border/30 rounded p-5 relative overflow-hidden flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded text-blue-400 border border-blue-500/20">
              <Award size={22} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Whitelist Tier Spot Allocation</p>
              <h3 className="text-2xl font-bold text-[#3b82f6] mt-1">{wlRegisteredCount}</h3>
              <p className="text-[10px] text-blue-400 font-mono mt-0.5">// Regular users with raffle access</p>
            </div>
            <div className="absolute right-2 bottom-2 text-blue-500/5 select-none font-mono text-6xl font-bold">WL</div>
          </div>

          <div className="bg-[#0c1215] border border-brand-border/30 rounded p-5 relative overflow-hidden flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded text-emerald-400 border border-emerald-500/20">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">Super FCFS Direct Claims</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{fcfsRegisteredCount}</h3>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">// Promptly claimed slots count</p>
            </div>
            <div className="absolute right-2 bottom-2 text-emerald-500/5 select-none font-mono text-6xl font-bold">FCFS</div>
          </div>

        </div>

        {/* Dynamic Analytics Charts (Guidelines: Recharts for charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area Chart: Registration Progression */}
          <div className="lg:col-span-2 bg-[#0c1215] border border-brand-border/30 rounded p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-teal-400 uppercase">// REGISTRATION progression TRACKER</h4>
                <p className="text-sm font-semibold text-white font-serif mt-1">Growth of Whitelist Submissions Over Time</p>
              </div>
              <Calendar size={16} className="text-brand-muted" />
            </div>

            <div className="h-[280px] w-full mt-4 relative">
              {totalEntries === 0 && (
                <div className="absolute inset-0 bg-[#0c1215]/90 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-10 rounded border border-dashed border-teal-500/20">
                  <TrendingUp size={32} className="text-teal-500/30 mb-2" />
                  <p className="text-xs font-mono text-teal-400 uppercase tracking-wider font-bold">// No Registration Progression Data //</p>
                  <p className="text-[10px] text-brand-muted/70 mt-1.5 max-w-xs">All metric data was purged. Awaiting real-time campaign submissions.</p>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1d2d34" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0c1215", border: "1px solid #20353f", borderRadius: "4px" }} 
                    labelStyle={{ color: "#9ca3af", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#14b8a6" }}
                  />
                  <Area type="monotone" dataKey="Registrations" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorRegistrations)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: WL Tier Allocation Distribution */}
          <div className="bg-[#0c1215] border border-brand-border/30 rounded p-6 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">// whitelist spots DISTRIBUTION</h4>
                  <p className="text-sm font-semibold text-white font-serif mt-1">Allocation Share Tiers</p>
                </div>
                <Layers size={16} className="text-brand-muted" />
              </div>

              <div className="h-[200px] w-full flex items-center justify-center relative">
                {totalEntries === 0 && (
                  <div className="absolute inset-0 bg-[#0c1215]/90 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-10 rounded border border-dashed border-amber-500/20">
                    <Layers size={32} className="text-amber-500/30 mb-2" />
                    <p className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">// Allocation Share Empty //</p>
                    <p className="text-[10px] text-brand-muted/70 mt-1.5 max-w-xs">No active wallet tiers are currently locked in the roster.</p>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0c1215", border: "1px solid #20353f", borderRadius: "4px" }} 
                      itemStyle={{ color: "#ffffff", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-brand-muted">{entry.name}</span>
                  </div>
                  <span className="font-mono text-white font-bold">{entry.value} spots</span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Google Sheets Dynamic Sync and Export Segment */}
        <div className="bg-[#0c1215] border border-brand-border/30 rounded p-6 space-y-6">
          
          <div className="border-b border-brand-border/30 pb-4">
            <h4 className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <FileSpreadsheet size={14} />
              Step 1: Synchronize Submissions directly to Admin Google Sheets
            </h4>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-2xl">
              Export verified community user registrations to your spreadsheets on Google Workspace instantly. Our secure auth connection appends live submissions accurately to your sheets of choosing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Auth Block */}
            <div className="bg-black/30 border border-brand-border/20 p-5 rounded flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">// ADMIN LINK ACCOUNT</span>
                <h5 className="text-sm font-bold text-white font-serif mt-1">Google Sheets Privilege Auth</h5>
                <p className="text-[11px] text-brand-muted mt-2 leading-relaxed">
                  Provide Sheets writing capability scopes. Ensure you log in using the host campaign manager email.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-border/20">
                {googleUser ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                      <div className="truncate max-w-[150px]">
                        <p className="text-xs font-bold text-white select-none leading-none">{googleUser.displayName || "Admin Account"}</p>
                        <p className="text-[10px] text-brand-muted truncate leading-relaxed mt-0.5">{googleUser.email}</p>
                      </div>
                      <button 
                        onClick={handleGoogleLogout}
                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/5 rounded transition-colors"
                        title="Disconnect Admin Account"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={handleGoogleSignIn}
                      className="w-full cursor-pointer bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <PlusCircle size={14} />
                      Authorize Google Account
                    </button>
                    {configError && (
                      <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded text-[11px] font-mono leading-relaxed space-y-1">
                        <p className="font-bold uppercase tracking-wider">// Configuration Alert</p>
                        <p>{configError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Target Settings Box */}
            <div className="bg-black/30 border border-brand-border/20 p-5 rounded flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">// Destination sheet settings</span>
                <h5 className="text-sm font-bold text-white font-serif mt-1">Select Spreadsheet Path</h5>
                
                <div className="mt-4 space-y-1">
                  <span className="text-[9px] font-semibold text-brand-muted uppercase tracking-wider font-mono">Current Target Sheet ID</span>
                  <input 
                    type="text" 
                    placeholder="Enter existing Google spreadsheet ID"
                    value={spreadsheetId}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setSpreadsheetId(val);
                      localStorage.setItem("luxvault_admin_sheet_id", val);
                      if (val) {
                        const url = `https://docs.google.com/spreadsheets/d/${val}/edit`;
                        setSpreadsheetUrl(url);
                        localStorage.setItem("luxvault_admin_sheet_url", url);
                      } else {
                        setSpreadsheetUrl("");
                        localStorage.removeItem("luxvault_admin_sheet_url");
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs font-mono text-white focus:outline-none placeholder:text-brand-muted"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button 
                  disabled={!googleUser || isExporting}
                  onClick={handleCreateSpreadsheet}
                  className="cursor-pointer text-xs text-[#20b2aa] font-mono tracking-wide hover:underline inline-flex items-center gap-1.5 disabled:opacity-40 disabled:no-underline"
                >
                  <PlusCircle size={13} />
                  Auto-create new template Whitelist Sheet
                </button>

                {spreadsheetUrl && (
                  <a 
                    href={spreadsheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-semibold hover:underline"
                  >
                    Open Active Google Sheet ↗
                  </a>
                )}
              </div>
            </div>

            {/* Sync trigger card */}
            <div className="bg-[#101c19]/30 border border-emerald-500/20 p-5 rounded flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">// EXPORT RECONCILIATION</span>
                <h5 className="text-sm font-bold text-white font-serif mt-1">Synchronize Responses</h5>
                
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-brand-muted">Total records in database:</span>
                  <span className="font-mono font-bold text-white px-2 py-0.5 bg-brand-bg-dark border border-brand-border/40 rounded">
                    {submissions.length} users
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                {syncStatus !== "idle" && (
                  <div className={`p-2.5 border text-[11px] leading-relaxed font-mono rounded ${
                    syncStatus === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}>
                    {syncStatus === "success" ? "✓ Done: " : "⚠️ Error: "} {statusMessage}
                  </div>
                )}

                <button 
                  disabled={!googleUser || !spreadsheetId || isExporting}
                  onClick={handleSyncToSheets}
                  className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-[#152024] disabled:text-gray-500 disabled:cursor-not-allowed border border-transparent shadow-sm"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Exporting to Sheet...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet size={14} />
                      Overwrite & Update Google Sheets
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Dynamic Campaign Settings & Maintenance Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Campaign Config */}
          <div className="lg:col-span-2 bg-[#0c1215] border border-brand-border/30 rounded p-6 space-y-6">
            <div className="border-b border-brand-border/30 pb-4">
              <h4 className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1.5">
                <Sparkles size={14} />
                Step 2: Customize Campaign Specifications & Rules
              </h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                Configure tweet mentioning requirements, total whitelists quota, pricing metadata, and active verification post URLs instantly.
              </p>
            </div>
            
            <form onSubmit={handleSaveCampaignConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-muted uppercase font-mono font-bold">Target X Username</label>
                  <input
                    type="text"
                    value={campaignConfig.targetAccount}
                    onChange={(e) => setCampaignConfig({...campaignConfig, targetAccount: e.target.value})}
                    className="w-full px-3 py-2.5 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs font-mono text-white focus:outline-none"
                    placeholder="LuxVault_"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-muted uppercase font-mono font-bold">Required Mention Word</label>
                  <input
                    type="text"
                    value={campaignConfig.requiredText}
                    onChange={(e) => setCampaignConfig({...campaignConfig, requiredText: e.target.value})}
                    className="w-full px-3 py-2.5 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs font-mono text-white focus:outline-none"
                    placeholder="@LuxVault_"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-brand-muted uppercase font-mono font-bold">Validation Target Post URL (Like & Retweet Target)</label>
                <input
                  type="text"
                  value={campaignConfig.targetPostUrl}
                  onChange={(e) => setCampaignConfig({...campaignConfig, targetPostUrl: e.target.value})}
                  className="w-full px-3 py-2.5 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs font-mono text-white focus:outline-none"
                  placeholder="https://x.com/LuxVault_/status/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-muted uppercase font-mono font-bold">Total Whitelist Supply</label>
                  <input
                    type="text"
                    value={campaignConfig.totalSupply}
                    onChange={(e) => setCampaignConfig({...campaignConfig, totalSupply: e.target.value})}
                    className="w-full px-3 py-2.5 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs font-mono text-white focus:outline-none"
                    placeholder="1111"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-muted uppercase font-mono font-bold">Mint Status Text Tag</label>
                  <input
                    type="text"
                    value={campaignConfig.mintPrice}
                    onChange={(e) => setCampaignConfig({...campaignConfig, mintPrice: e.target.value})}
                    className="w-full px-3 py-2.5 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs font-mono text-white focus:outline-none"
                    placeholder="Free Mint"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                {configSaveStatus !== "idle" && (
                  <span className={`text-[10px] font-mono ${configSaveStatus === "success" ? "text-emerald-400" : "text-red-400"}`}>
                    {configSaveStatus === "success" ? "✓ Done: Settings initialized & saved!" : `⚠️ Error: ${configSaveMessage}`}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="cursor-pointer ml-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-5 rounded text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  Save Settings & Update UI
                </button>
              </div>
            </form>
          </div>

          {/* Destructive purges */}
          <div className="bg-[#1c0f0f]/40 border border-red-900/40 rounded p-6 flex flex-col justify-between">
            <div>
              <div className="border-b border-red-900/40 pb-4">
                <h4 className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  Destructive Purge Center
                </h4>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Reset whitelist metric progressions or securely clean user submission caches.
                </p>
              </div>

              <div className="mt-4 p-3 bg-red-950/20 border border-red-900/20 rounded text-[11px] font-mono text-red-300 leading-relaxed space-y-2">
                <p className="font-bold uppercase tracking-wider">// HARD DATABASE WIPEOUT</p>
                <p>This actions wipes clean every single registered user profile, wallet allocations, and tasks state permanently. Irreversible.</p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleGlobalReset}
                className="cursor-pointer w-full bg-red-600/90 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/30 shadow-lg"
              >
                <AlertTriangle size={14} />
                Purge All DB Submissions
              </button>
            </div>
          </div>

        </div>

        {/* User Submissions campaigns Database Table */}
        <div className="bg-[#0c1215] border border-brand-border/30 rounded p-6 space-y-6">
          
          {/* Filters & search line */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/20 pb-4">
            <div>
              <h4 className="text-xs font-mono font-bold tracking-wider text-teal-400 uppercase flex items-center gap-1.5">
                <Database size={14} />
                Step 2: Collected Campaigns User Data
              </h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                Query, filter, and inspect physical records saved securely in the SQLite campaign registry.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              {/* Search user */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  placeholder="Query wallet, X handle, link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[220px] bg-black/40 border border-brand-border/40 focus:border-teal-500 rounded pl-9 pr-3 py-2 text-xs text-white placeholder:text-brand-muted/80 focus:outline-none font-mono"
                />
              </div>

              {/* Tier Spot Filter */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-brand-border/40 rounded px-2.5 py-2">
                <Filter size={12} className="text-brand-muted" />
                <select 
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-transparent text-xs text-white border-none focus:outline-none font-mono font-medium cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  <option value="fcfs">FCFS Direct</option>
                  <option value="wl">Standard WL</option>
                  <option value="gtd">GTD Super WL</option>
                </select>
              </div>

              {/* Refresh buttons */}
              <button 
                onClick={fetchSubmissions}
                disabled={isLoadingSubmissions}
                className="cursor-pointer font-mono text-xs bg-[#192a30]/60 hover:bg-[#192a30] text-[#a5cbd7] border border-[#2e4c56] hover:border-[#406875] px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className={isLoadingSubmissions ? "animate-spin" : ""} />
                Refresh DB
              </button>

            </div>
          </div>

          {/* Submissions Table element */}
          <div className="border border-brand-border/20 rounded-lg overflow-hidden bg-black/20">
            {filteredSubmissions.length === 0 ? (
              <div className="p-16 text-center text-xs text-brand-muted uppercase font-mono tracking-widest leading-relaxed">
                No whitelist campaign entries found matching the active query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0b1013] border-b border-brand-border/30 text-brand-muted uppercase font-mono text-[9px] tracking-wider select-none">
                      <th className="py-3 px-4">User Wallet (ID)</th>
                      <th className="py-3 px-4">X (Twitter) Handle</th>
                      <th className="py-3 px-4">Invite Link</th>
                      <th className="py-3 px-4">Art submission link</th>
                      <th className="py-3 px-4">Allocated Wallets Tiers</th>
                      <th className="py-3 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/10">
                    {filteredSubmissions.map((sub, idx) => {
                      const { fcfs, wl, gtd } = getParsedWallets(sub);

                      return (
                        <tr key={idx} className="hover:bg-teal-500/5 transition-colors">
                          {/* User Wallet */}
                          <td className="py-3 px-4 font-mono font-semibold text-[#14b8a6]">
                            <span className="cursor-pointerhover:underline" onClick={() => setSelectedSubmission(sub)} title={sub.walletAddress}>
                              {sub.walletAddress ? `${sub.walletAddress.slice(0, 10)}...${sub.walletAddress.slice(-6)}` : "N/A"}
                            </span>
                          </td>

                          {/* X Handle */}
                          <td className="py-3 px-4 font-mono">
                            {sub.twitterUsername ? (
                              <a 
                                href={`https://x.com/${sub.twitterUsername}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="hover:underline flex items-center gap-1 text-sky-400"
                              >
                                <Twitter size={11} />
                                @{sub.twitterUsername}
                              </a>
                            ) : (
                              <span className="text-brand-muted">Not linked</span>
                            )}
                          </td>

                          {/* Invite Link */}
                          <td className="py-3 px-4 truncate max-w-[150px]" title={sub.inviteLink || ""}>
                            {sub.inviteLink ? (
                              <span className="text-white hover:underline cursor-pointer flex items-center gap-1" onClick={() => setSelectedSubmission(sub)}>
                                <Link size={10} className="text-brand-muted" />
                                {sub.inviteLink.replace(/^https?:\/\//, "")}
                              </span>
                            ) : (
                              <span className="text-brand-muted">N/A</span>
                            )}
                          </td>

                          {/* Art Link */}
                          <td className="py-3 px-4 font-mono truncate max-w-[140px]" title={sub.artLink || ""}>
                            {sub.artLink ? (
                              <a 
                                href={sub.artLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="hover:underline text-teal-300 flex items-center gap-1"
                              >
                                {sub.artLink.length > 20 ? `${sub.artLink.slice(0, 18)}...` : sub.artLink}
                                ↗
                              </a>
                            ) : (
                              <span className="text-brand-muted">None uploaded</span>
                            )}
                          </td>

                          {/* Allocated spots */}
                          <td className="py-3 px-4 space-y-1 font-mono">
                            {fcfs && (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] tracking-wider uppercase font-semibold bg-emerald-500/10 text-emerald-400 px-1 rounded border border-emerald-500/20">FCFS:</span>
                                <span className="text-[10px] text-brand-muted inline-block max-w-[120px] truncate" title={fcfs}>
                                  {fcfs.slice(0,6)}...
                                </span>
                              </div>
                            )}

                            {wl && (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] tracking-wider uppercase font-semibold bg-blue-500/10 text-blue-400 px-1 rounded border border-blue-500/20">WL:</span>
                                <span className="text-[10px] text-brand-muted inline-block max-w-[120px] truncate" title={wl}>
                                  {wl.slice(0,6)}...
                                </span>
                              </div>
                            )}

                            {gtd && (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] tracking-wider uppercase font-semibold bg-amber-500/10 text-amber-500 px-1 rounded border border-amber-500/20">GTD:</span>
                                <span className="text-[10px] text-brand-muted inline-block max-w-[120px] truncate" title={gtd}>
                                  {gtd.slice(0,6)}...
                                </span>
                              </div>
                            )}

                            {!fcfs && !wl && !gtd && (
                              <span className="text-brand-muted font-normal text-[10px]">No allocations saved</span>
                            )}
                          </td>

                          {/* Inspection Action */}
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => setSelectedSubmission(sub)}
                              className="cursor-pointer text-[10px] tracking-wider font-mono uppercase text-teal-400 hover:text-white bg-teal-500/5 hover:bg-teal-500/20 px-2.5 py-1.5 rounded border border-teal-500/20 transition-all font-semibold"
                            >
                              Inspect Detailed Response
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Submissions count footer label */}
          <div className="flex items-center justify-between text-xs text-brand-muted font-mono uppercase">
            <span>Query output: showing {filteredSubmissions.length} of {submissions.length} total register entries</span>
            <span>LuxVault Database Engine sqlite // ready</span>
          </div>

        </div>
        </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* CMS Panel Header controls */}
            <div className="bg-[#0c1215] border border-brand-border/30 rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400 animate-pulse" />
                  WordPress Drag-N-Drop Visual Page Editor [GUI CMS]
                </h2>
                <p className="text-xs text-brand-muted mt-1 max-w-2xl leading-relaxed">
                  Visually build and reorganize your landing page sections in real-time. Change text, hashtags, hyperlinks, button styles, hover effects, and section order.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {cmsSaveStatus !== "idle" && (
                  <div className={`px-3 py-1.5 border text-xs font-mono rounded ${
                    cmsSaveStatus === "saved" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : cmsSaveStatus === "saving"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}>
                    {cmsSaveStatus === "saved" ? "✓ SUCCESS: " : cmsSaveStatus === "saving" ? "⏳ SAVING: " : "⚠️ ERROR: "} {cmsMessage || "Applying layout overrides"}
                  </div>
                )}

                <button
                  disabled={isCmsLoading || cmsSaveStatus === "saving"}
                  onClick={handlePublishCMS}
                  className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-3 px-6 rounded text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  <Check size={14} className="stroke-[3]" />
                  Update & Publish Live Site
                </button>
              </div>
            </div>

            {/* Content editor columns */}
            {isCmsLoading ? (
              <div className="p-24 text-center text-xs font-mono text-brand-muted uppercase tracking-widest leading-relaxed">
                <RefreshCw size={20} className="animate-spin mx-auto mb-3 text-amber-500" />
                Loading visual editor structural components...
              </div>
            ) : cmsLayout.length === 0 ? (
              <div className="p-24 text-center text-xs font-mono text-brand-muted uppercase tracking-widest leading-relaxed border border-dashed border-brand-border/20 rounded">
                Could not load visual layout template. Please check page-schema.json.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left controls column */}
                <div className="xl:col-span-5 space-y-6">
                  
                  {/* Section Arrangement Control */}
                  <div className="bg-[#0c1215] border border-brand-border/30 rounded p-6">
                    <div className="border-b border-brand-border/20 pb-4 mb-4">
                      <h4 className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1.5">
                        <Layers size={14} />
                        Layout Hierarchy & Visibility
                      </h4>
                      <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                        Drag items to reorder, or use Up/Down arrows. Checkboxes toggle section visibility instantly. Click "Configure" to edit text and buttons.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {cmsLayout.map((sec, idx) => {
                        const isFocused = activeAccordion === sec.id;
                        
                        return (
                          <div 
                            key={sec.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", idx.toString());
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const sourceIdxStr = e.dataTransfer.getData("text/plain");
                              if (!sourceIdxStr) return;
                              const sourceIdx = parseInt(sourceIdxStr, 10);
                              if (sourceIdx === idx || isNaN(sourceIdx)) return;
                              
                              const updated = [...cmsLayout];
                              const [removed] = updated.splice(sourceIdx, 1);
                              updated.splice(idx, 0, removed);
                              setCmsLayout(updated);
                            }}
                            className={`flex items-center justify-between p-3 rounded border transition-all bg-black/40 cursor-grab active:cursor-grabbing ${
                              isFocused 
                                ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-950/20' 
                                : 'border-brand-border/30 hover:border-brand-border/70'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Grabber indicator */}
                              <div className="text-brand-muted/70 hover:text-white cursor-row-resize select-none font-mono text-sm leading-none">
                                ☰
                              </div>

                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={sec.enabled !== false}
                                  onChange={() => {
                                    setCmsLayout(prev => prev.map(s => s.id === sec.id ? { ...s, enabled: !s.enabled } : s));
                                  }}
                                  className="rounded bg-black border-brand-border/40 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className={`text-[11px] font-mono tracking-wider font-bold ${sec.enabled === false ? 'text-brand-muted line-through' : 'text-white'}`}>
                                  {sec.name.toUpperCase()}
                                </span>
                              </label>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button 
                                disabled={idx === 0}
                                onClick={() => {
                                  const updated = [...cmsLayout];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  setCmsLayout(updated);
                                }}
                                className="text-[10px] p-1 border border-brand-border/30 hover:border-brand-muted hover:bg-white/5 rounded text-brand-muted hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer font-bold leading-none"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button 
                                disabled={idx === cmsLayout.length - 1}
                                onClick={() => {
                                  const updated = [...cmsLayout];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  setCmsLayout(updated);
                                }}
                                className="text-[10px] p-1 border border-brand-border/30 hover:border-brand-muted hover:bg-white/5 rounded text-brand-muted hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer font-bold leading-none"
                                title="Move Down"
                              >
                                ▼
                              </button>
                              <button 
                                onClick={() => setActiveAccordion(sec.id)}
                                className={`text-[10px] uppercase font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                                  isFocused 
                                    ? 'bg-amber-500 text-black border-amber-500 font-bold' 
                                    : 'bg-[#121c20] hover:bg-brand-border/30 text-brand-muted hover:text-white border-brand-border/30'
                                }`}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual accordion editors */}
                  <div className="space-y-4">
                    
                    {/* NAVBAR EDITOR */}
                    {activeAccordion === "navbar" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// NAV BAR TEMPLATE</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">HEADER</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Logo Brand text</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "navbar")?.logoText || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "navbar" ? { ...s, logoText: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white uppercase focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Button Text Label</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "navbar")?.buttonText || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "navbar" ? { ...s, buttonText: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white uppercase focus:outline-none font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Button Size Dimensions</label>
                              <select 
                                value={cmsLayout.find(s => s.id === "navbar")?.buttonSize || "md"} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "navbar" ? { ...s, buttonSize: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/50 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none cursor-pointer"
                              >
                                <option value="sm">Small size (sm)</option>
                                <option value="md">Standard medium (md)</option>
                                <option value="lg">Large prominent (lg)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Animation & Hover Effect</label>
                              <select 
                                value={cmsLayout.find(s => s.id === "navbar")?.buttonEffect || "solid"} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "navbar" ? { ...s, buttonEffect: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/50 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none cursor-pointer"
                              >
                                <option value="solid">LuxVault Solid Teal Accent</option>
                                <option value="gradient">Cosmic Neon Emerald Glow</option>
                                <option value="outline">Framed Structural Border</option>
                              </select>
                            </div>
                          </div>

                          {/* Navbar links */}
                          <div className="space-y-2 pt-2 border-t border-brand-border/20">
                            <label className="text-[10px] text-brand-muted uppercase block font-semibold">// Navigation Hyperlinks list</label>
                            {(cmsLayout.find(s => s.id === "navbar")?.links || []).map((link: any, lIdx: number) => (
                              <div key={link.id || lIdx} className="grid grid-cols-2 gap-2 items-center bg-black/30 p-2.5 rounded border border-brand-border/20">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase font-mono">Link caption</span>
                                  <input 
                                    type="text" 
                                    value={link.label} 
                                    onChange={(e) => {
                                      const currentLinks = [...(cmsLayout.find(s => s.id === "navbar")?.links || [])];
                                      currentLinks[lIdx] = { ...currentLinks[lIdx], label: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "navbar" ? { ...s, links: currentLinks } : s));
                                    }}
                                    className="px-2 py-1 bg-black/60 border border-brand-border/40 focus:border-amber-500 rounded text-[11px] text-white uppercase focus:outline-none w-full"
                                    placeholder="Label"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase font-mono">Anchor / Location</span>
                                  <input 
                                    type="text" 
                                    value={link.href} 
                                    onChange={(e) => {
                                      const currentLinks = [...(cmsLayout.find(s => s.id === "navbar")?.links || [])];
                                      currentLinks[lIdx] = { ...currentLinks[lIdx], href: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "navbar" ? { ...s, links: currentLinks } : s));
                                    }}
                                    className="px-2 py-1 bg-black/60 border border-brand-border/40 focus:border-amber-500 rounded text-[11px] text-white focus:outline-none w-full"
                                    placeholder="#stages"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HERO EDITOR */}
                    {activeAccordion === "hero" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// HERO PRESENTATION TEMPLATE</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">INTRO</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Tagline tag (above header)</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "hero")?.tagline || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, tagline: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-teal-300 focus:outline-none uppercase"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase" style={{ fontWeight: "bold" }}>Headline title display text</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "hero")?.title || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, title: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none uppercase font-serif"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Narrative subtitle copy</label>
                            <textarea 
                              rows={3}
                              value={cmsLayout.find(s => s.id === "hero")?.subtitle || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, subtitle: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none resize-none leading-relaxed"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 border-t border-brand-border/10 pt-2 col-span-2">
                              <label className="text-[10px] text-brand-muted uppercase">Structural structural template</label>
                              <select 
                                value={cmsLayout.find(s => s.id === "hero")?.columnLayout || "two-col"} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, columnLayout: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/50 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none cursor-pointer"
                              >
                                <option value="one-col">Single Column (Symmetrical Centered Layout)</option>
                                <option value="two-col">Two Columns (Split Layout Grid)</option>
                              </select>
                            </div>
                          </div>

                          <div className="border-t border-brand-border/20 pt-3 space-y-3">
                            <p className="text-[10px] text-amber-500 uppercase font-bold">// HERO CENTRAL CALL-TO-ACTION BUTTON</p>
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Button Copy Label</label>
                              <input 
                                type="text" 
                                value={cmsLayout.find(s => s.id === "hero")?.buttonText || ""} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, buttonText: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white uppercase focus:outline-none font-bold"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-brand-muted uppercase">Button Dimensions Size</label>
                                <select 
                                  value={cmsLayout.find(s => s.id === "hero")?.buttonSize || "lg"} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, buttonSize: val } : s));
                                  }}
                                  className="w-full px-3 py-2 bg-black/50 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none cursor-pointer"
                                >
                                  <option value="sm">Small size (sm)</option>
                                  <option value="md">Standard medium (md)</option>
                                  <option value="lg">Large prominent (lg)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-brand-muted uppercase">Animation Hover Effect</label>
                                <select 
                                  value={cmsLayout.find(s => s.id === "hero")?.buttonEffect || "solid"} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, buttonEffect: val } : s));
                                  }}
                                  className="w-full px-3 py-2 bg-black/50 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none cursor-pointer"
                                >
                                  <option value="solid">LuxVault Solid Teal Accent</option>
                                  <option value="gradient">Cosmic Emerald Glow Gradient</option>
                                  <option value="outline">Subtle Framed Outline</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Hyperlink Href Target Anchor</label>
                              <input 
                                type="text" 
                                value={cmsLayout.find(s => s.id === "hero")?.buttonHref || ""} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, buttonHref: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none font-mono"
                                placeholder="#stages"
                              />
                            </div>
                          </div>

                          {/* Stats parameters */}
                          <div className="border-t border-brand-border/20 pt-3 space-y-2">
                            <label className="text-[10px] text-brand-muted uppercase block font-bold">// Stats Indicators on Front Hero Card (Max 2)</label>
                            {(cmsLayout.find(s => s.id === "hero")?.stats || []).map((stat: any, sIdx: number) => (
                              <div key={sIdx} className="grid grid-cols-2 gap-2 bg-black/30 p-2 rounded border border-brand-border/20">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase">Stat Name / Label</span>
                                  <input 
                                    type="text" 
                                    value={stat.label} 
                                    onChange={(e) => {
                                      const currentStats = [...(cmsLayout.find(s => s.id === "hero")?.stats || [])];
                                      currentStats[sIdx] = { ...currentStats[sIdx], label: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, stats: currentStats } : s));
                                    }}
                                    className="px-2 py-1 bg-black/60 border border-brand-border/40 focus:border-amber-500 rounded text-[11px] text-white focus:outline-none w-full"
                                    placeholder="Total Supply"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase">Current Value</span>
                                  <input 
                                    type="text" 
                                    value={stat.value} 
                                    onChange={(e) => {
                                      const currentStats = [...(cmsLayout.find(s => s.id === "hero")?.stats || [])];
                                      currentStats[sIdx] = { ...currentStats[sIdx], value: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "hero" ? { ...s, stats: currentStats } : s));
                                    }}
                                    className="px-2 py-1 bg-black/60 border border-brand-border/40 focus:border-amber-500 rounded text-[11px] text-teal-400 font-bold focus:outline-none w-full"
                                    placeholder="1111"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WL STAGES EDITOR */}
                    {activeAccordion === "wlstages" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// MISSION STAGES TEMPLATE</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">STAGES</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Header headline title</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "wlstages")?.heading || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlstages" ? { ...s, heading: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white uppercase focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Description Guidelines text</label>
                            <textarea 
                              rows={3}
                              value={cmsLayout.find(s => s.id === "wlstages")?.description || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlstages" ? { ...s, description: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none resize-none leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1 border-t border-brand-border/15 pt-3">
                            <label className="text-[10px] text-amber-500 uppercase font-bold">// SOCIAL ACCREDITATION RULES</label>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">X (Twitter) Handle target to follow</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "wlstages")?.targetAccount || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlstages" ? { ...s, targetAccount: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-teal-300 focus:outline-none font-mono"
                              placeholder="LuxVault_"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Twitter validation target post URL</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "wlstages")?.targetPostUrl || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlstages" ? { ...s, targetPostUrl: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none font-mono"
                              placeholder="https://x.com/LuxVault_/..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Mentions hashtag required in post</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "wlstages")?.requiredText || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlstages" ? { ...s, requiredText: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-amber-400 focus:outline-none font-mono"
                              placeholder="@LuxVault_"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WL CHECKER EDITOR */}
                    {activeAccordion === "wlchecker" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// ROSTER CHECKER TEMPLATE</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">CHECKER</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase font-bold">Eligibility checker main title</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "wlchecker")?.heading || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlchecker" ? { ...s, heading: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none uppercase font-serif"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Eligibility checker notes instructions</label>
                            <textarea 
                              rows={3}
                              value={cmsLayout.find(s => s.id === "wlchecker")?.description || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "wlchecker" ? { ...s, description: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LIVE METRICS EDITOR */}
                    {activeAccordion === "livestats" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// LIVE METRICS GRID</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">GRID</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <label className="text-[10px] text-brand-muted uppercase block font-semibold">// Live stats cards metadata (Total 4 Columns)</label>
                          {(cmsLayout.find(s => s.id === "livestats")?.stats || []).map((stat: any, sIdx: number) => (
                            <div key={sIdx} className="bg-black/30 p-3 rounded border border-brand-border/20 space-y-2">
                              <div className="flex items-center justify-between border-b border-[#20353f] pb-1.5 mb-1.5 select-none">
                                <span className="text-[10px] text-amber-500 font-mono uppercase font-bold">// METRICS CELL #{sIdx+1}</span>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={stat.active === true} 
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const currentStats = [...(cmsLayout.find(s => s.id === "livestats")?.stats || [])];
                                      currentStats[sIdx] = { ...currentStats[sIdx], active: checked };
                                      setCmsLayout(prev => prev.map(s => s.id === "livestats" ? { ...s, stats: currentStats } : s));
                                    }}
                                    className="rounded bg-black border-brand-border text-amber-500 focus:ring-amber-500 w-3 h-3 cursor-pointer"
                                  />
                                  <span className="text-[9px] text-brand-muted uppercase hover:text-white">Active Glow State</span>
                                </label>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase select-none">Label</span>
                                  <input 
                                    type="text" 
                                    value={stat.title} 
                                    onChange={(e) => {
                                      const currentStats = [...(cmsLayout.find(s => s.id === "livestats")?.stats || [])];
                                      currentStats[sIdx] = { ...currentStats[sIdx], title: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "livestats" ? { ...s, stats: currentStats } : s));
                                    }}
                                    className="w-full px-2 py-1 bg-black/60 border-brand-border/30 rounded text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase select-none">Value tag</span>
                                  <input 
                                    type="text" 
                                    value={stat.value} 
                                    onChange={(e) => {
                                      const currentStats = [...(cmsLayout.find(s => s.id === "livestats")?.stats || [])];
                                      currentStats[sIdx] = { ...currentStats[sIdx], value: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "livestats" ? { ...s, stats: currentStats } : s));
                                    }}
                                    className="w-full px-2 py-1 bg-black/60 border border-brand-border/30 rounded text-xs text-white font-bold focus:outline-none font-serif"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-brand-muted uppercase select-none">Subtext</span>
                                  <input 
                                    type="text" 
                                    value={stat.subtext} 
                                    onChange={(e) => {
                                      const currentStats = [...(cmsLayout.find(s => s.id === "livestats")?.stats || [])];
                                      currentStats[sIdx] = { ...currentStats[sIdx], subtext: e.target.value };
                                      setCmsLayout(prev => prev.map(s => s.id === "livestats" ? { ...s, stats: currentStats } : s));
                                    }}
                                    className="w-full px-2 py-1 bg-black/60 border border-brand-border/30 rounded text-xs text-white focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PREVIEW FRAME EDITOR */}
                    {activeAccordion === "preview" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// SIGNAL PREVIEW FRAME</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">PREVIEW</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase font-bold">Main title of Section</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "preview")?.title || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "preview" ? { ...s, title: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none font-serif"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase font-bold">Subtitle of Section</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "preview")?.subtitle || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "preview" ? { ...s, subtitle: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-brand-border/10 pt-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Card top branding tag</label>
                              <input 
                                type="text" 
                                value={cmsLayout.find(s => s.id === "preview")?.cardTop || ""} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "preview" ? { ...s, cardTop: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none uppercase"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Card bottom tag status</label>
                              <input 
                                type="text" 
                                value={cmsLayout.find(s => s.id === "preview")?.cardBottom || ""} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "preview" ? { ...s, cardBottom: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none uppercase"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Card Locked Screen Title</label>
                              <input 
                                type="text" 
                                value={cmsLayout.find(s => s.id === "preview")?.lockHeading || ""} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "preview" ? { ...s, lockHeading: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-muted uppercase">Card Locked Screen Label</label>
                              <input 
                                type="text" 
                                value={cmsLayout.find(s => s.id === "preview")?.lockSubtitle || ""} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCmsLayout(prev => prev.map(s => s.id === "preview" ? { ...s, lockSubtitle: val } : s));
                                }}
                                className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FOOTER EDITOR */}
                    {activeAccordion === "footer" && (
                      <div className="bg-[#0c1215] border border-amber-500/40 rounded p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-brand-border/20 pb-3 flex items-center justify-between">
                          <h5 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">// FOOTER METADATA HUB</h5>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-amber-500/20 font-semibold">FOOTER</span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Logo Brand label text</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "footer")?.logoText || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "footer" ? { ...s, logoText: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white uppercase focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase">Campaign Footer summary narrative</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "footer")?.tagline || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "footer" ? { ...s, tagline: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/40 focus:border-amber-500 rounded text-xs text-white focus:outline-none font-sans"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-muted uppercase font-bold">Copyright notice labels</label>
                            <input 
                              type="text" 
                              value={cmsLayout.find(s => s.id === "footer")?.copyright || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setCmsLayout(prev => prev.map(s => s.id === "footer" ? { ...s, copyright: val } : s));
                              }}
                              className="w-full px-3 py-2 bg-black/40 border border-brand-border/30 rounded text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right controls column: Real-time Live Simulated Viewport */}
                <div className="xl:col-span-7 space-y-4 sticky top-24 select-none">
                  <div className="flex items-center justify-between border-b border-[#20353f]/40 pb-2">
                    <h5 className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase">// Live Wordpress-like CMS GUI Viewport Simulator</h5>
                    <div className="flex items-center gap-1.5 text-[9px] text-brand-muted uppercase font-mono bg-[#0c1215] border border-brand-border/20 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Direct Live Render
                    </div>
                  </div>

                  {/* Browser Sandbox container */}
                  <div className="border border-brand-border/40 rounded-lg bg-[#04080a] overflow-hidden flex flex-col shadow-2xl relative">
                    {/* Browser layout header */}
                    <div className="bg-[#0c1215] px-4 py-2.5 flex items-center justify-between border-b border-brand-border/20 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] opacity-80"></span>
                      </div>
                      <div className="bg-black/60 border border-brand-border/30 rounded text-[10px] text-brand-muted/70 px-12 py-1.5 font-mono hover:text-white transition-colors cursor-pointer w-2/3 text-center truncate select-none">
                        https://luxvault-gated-genesis.app/live-sandbox
                      </div>
                      <div className="w-12"></div>
                    </div>

                    {/* Simulated screen body */}
                    <div className="h-[650px] overflow-y-auto bg-[#04080a] scrollbar-thin scrollbar-thumb-brand-border/45 flex flex-col relative scale-[1] origin-top transition-transform">
                      {cmsLayout.map(sec => {
                        if (sec.enabled === false) return null;
                        
                        const isFocused = activeAccordion === sec.id;

                        return (
                          <div 
                            key={sec.id}
                            onClick={() => setActiveAccordion(sec.id)}
                            className={`relative cursor-pointer group transition-all duration-200 border-y ${
                              isFocused 
                                ? 'border-amber-500/80 bg-amber-500/[0.01] ring-2 ring-amber-500/40 ring-inset z-[5]' 
                                : 'border-transparent hover:border-white/10'
                            }`}
                          >
                            {/* Focus label banner overlay */}
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-mono font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-20 shadow-md">
                              Configure {sec.name} Visuals
                            </div>
                            
                            {/* Section content rendering */}
                            <div className="pointer-events-none select-none">
                              {sec.id === "navbar" && <Navbar data={sec} />}
                              {sec.id === "hero" && <Hero data={sec} />}
                              {sec.id === "wlstages" && <WLStages data={sec} />}
                              {sec.id === "wlchecker" && <WLChecker data={sec} />}
                              {sec.id === "livestats" && <LiveStats data={sec} />}
                              {sec.id === "preview" && <PreviewSection data={sec} />}
                              {sec.id === "footer" && <Footer data={sec} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* Submission Detail Overlay Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1013] border border-brand-border/50 max-w-xl w-full rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-brand-border/30 bg-[#0c1316] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="text-teal-400" size={18} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Whitelist Campaign Data Record</h3>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-brand-muted hover:text-white font-mono text-xs uppercase px-2 py-1 hover:bg-white/5 border border-transparent hover:border-brand-border/20 rounded cursor-pointer"
              >
                Close [esc]
              </button>
            </div>

            {/* Content list */}
            <div className="p-6 space-y-4 text-xs font-mono">
              
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted uppercase">Connected Web3 Wallet Address (Master Key)</span>
                <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-sm break-all font-semibold text-teal-300">
                  {selectedSubmission.walletAddress || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-brand-muted uppercase">X (Twitter) Username</span>
                  <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-white font-semibold">
                    {selectedSubmission.twitterUsername ? `@${selectedSubmission.twitterUsername}` : "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-brand-muted uppercase">Registration Date</span>
                  <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-brand-accent">
                    {new Date(selectedSubmission.createdAt || Date.now()).toLocaleDateString() + " " + new Date(selectedSubmission.createdAt || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted uppercase">Campaign Invite Attribution Link</span>
                <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-white break-all">
                  {selectedSubmission.inviteLink || "None created"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted uppercase">Community Art Submission Link</span>
                {selectedSubmission.artLink ? (
                  <a 
                    href={selectedSubmission.artLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block p-2.5 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 rounded-sm text-teal-300 break-all transition-colors underline"
                  >
                    {selectedSubmission.artLink} ↗
                  </a>
                ) : (
                  <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-brand-muted">
                    No Art submitted
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-brand-muted uppercase">Quote Tweet URL Verification</span>
                  {selectedSubmission.quoteTweetUrl ? (
                    <a 
                      href={selectedSubmission.quoteTweetUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="block p-2.5 bg-black/40 hover:bg-black/60 border border-brand-border/20 hover:border-brand-border/40 rounded-sm text-sky-400 break-all truncate transition-transform"
                    >
                      {selectedSubmission.quoteTweetUrl} ↗
                    </a>
                  ) : (
                    <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-brand-muted">Not provided</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-brand-muted uppercase">Post Comment Verification URL</span>
                  {selectedSubmission.commentUrl ? (
                    <a 
                      href={selectedSubmission.commentUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="block p-2.5 bg-black/40 hover:bg-black/60 border border-brand-border/20 hover:border-brand-border/40 rounded-sm text-sky-400 break-all truncate"
                    >
                      {selectedSubmission.commentUrl} ↗
                    </a>
                  ) : (
                    <p className="p-2.5 bg-black/40 border border-brand-border/20 rounded-sm text-brand-muted">Not provided</p>
                  )}
                </div>
              </div>

              {/* Parsed whitelist levels */}
              <div className="pt-2 border-t border-brand-border/20 space-y-2">
                <span className="text-[10px] text-brand-muted uppercase">Registered Destination Wallets per stage</span>
                
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  
                  <div className="bg-[#0c1215] border border-brand-border/30 rounded p-2 text-center">
                    <p className="text-[9px] text-[#10b981] font-bold uppercase tracking-wider">FCFS Claim Wallet</p>
                    <p className="font-semibold text-white mt-1 select-all truncate" title={getParsedWallets(selectedSubmission).fcfs || "N/A"}>
                      {getParsedWallets(selectedSubmission).fcfs 
                        ? `${getParsedWallets(selectedSubmission).fcfs.slice(0, 6)}...${getParsedWallets(selectedSubmission).fcfs.slice(-4)}`
                        : "N/A"
                      }
                    </p>
                  </div>

                  <div className="bg-[#0c1215] border border-brand-border/30 rounded p-2 text-center">
                    <p className="text-[9px] text-[#3b82f6] font-bold uppercase tracking-wider">WL Claim Wallet</p>
                    <p className="font-semibold text-white mt-1 select-all truncate" title={getParsedWallets(selectedSubmission).wl || "N/A"}>
                      {getParsedWallets(selectedSubmission).wl 
                        ? `${getParsedWallets(selectedSubmission).wl.slice(0, 6)}...${getParsedWallets(selectedSubmission).wl.slice(-4)}`
                        : "N/A"
                      }
                    </p>
                  </div>

                  <div className="bg-[#0c1215] border border-brand-border/30 rounded p-2 text-center">
                    <p className="text-[9px] text-[#f59e0b] font-bold uppercase tracking-wider">GTD Super WL Wallet</p>
                    <p className="font-semibold text-white mt-1 select-all truncate" title={getParsedWallets(selectedSubmission).gtd || "N/A"}>
                      {getParsedWallets(selectedSubmission).gtd 
                        ? `${getParsedWallets(selectedSubmission).gtd.slice(0, 6)}...${getParsedWallets(selectedSubmission).gtd.slice(-4)}`
                        : "N/A"
                      }
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-brand-border/30 bg-[#0c1316] flex justify-between items-center">
              <button 
                onClick={() => handleDeleteSingleSubmission(selectedSubmission.walletAddress)}
                className="cursor-pointer text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-500/50 px-4 py-2 rounded-sm transition-all flex items-center gap-1.5"
              >
                <AlertTriangle size={13} />
                Prune User Progress
              </button>
              
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="cursor-pointer text-xs font-mono text-brand-muted hover:text-white px-4 py-2 hover:bg-white/5 border border-brand-border/20 rounded-sm transition-colors font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
