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
  LayoutGrid, 
  Globe, 
  User, 
  Link2,
  ListFilter
} from "lucide-react";
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

export function AdminPanel() {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
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

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initSheetsAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (isAdminPanelOpen) {
      fetchSubmissions();
    }
  }, [isAdminPanelOpen]);

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithGoogleSheets();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setSyncStatus("idle");
      }
    } catch (err: any) {
      alert("Google Login failed: " + err.message);
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

      const result = await createAdminSpreadsheet(token, "LuxVault Whitelist Submissions");
      setSpreadsheetId(result.spreadsheetId);
      setSpreadsheetUrl(result.spreadsheetUrl);
      localStorage.setItem("luxvault_admin_sheet_id", result.spreadsheetId);
      localStorage.setItem("luxvault_admin_sheet_url", result.spreadsheetUrl);

      setStatusMessage("Spreadsheet created! Initializing columns...");
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
      setStatusMessage("Preparing data to export...");
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

      // Format submission records to match the 10 headers
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
          new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        ];
      });

      setStatusMessage(`Syncing ${rows.length} rows to Google Sheet...`);
      await writeRowsToSpreadsheet(token, spreadsheetId, rows);

      setSyncStatus("success");
      setStatusMessage(`Exported ${rows.length} responses to Google Sheets!`);
    } catch (err: any) {
      console.error(err);
      setSyncStatus("error");
      setStatusMessage(`Sync failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
      {/* Floating admin control trigger */}
      <button 
        onClick={() => setIsAdminPanelOpen(true)}
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light px-5 py-2.5 rounded-sm text-xs font-mono tracking-wider font-semibold uppercase shadow-md transition-colors border border-brand-border/20 cursor-pointer"
        id="admin-panel-btn"
      >
        <Lock size={13} />
        Admin Control Pane
      </button>

      {/* Admin Panel Dialog Backdrop */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-brand-border text-brand-primary rounded-xl max-w-4xl w-full select-none shadow-2xl overflow-hidden my-8 animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-brand-border bg-brand-bg-light/85 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="text-emerald-600" size={22} />
                <div>
                  <h3 className="text-lg font-bold font-serif text-brand-accent">ADMIN SHEET CONSOLE</h3>
                  <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">// PERSIST SUBMISSIONS TO GOOGLE SPREADSHEETS</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAdminPanelOpen(false)}
                className="text-brand-muted hover:text-brand-accent font-mono text-sm uppercase px-3 py-1 bg-brand-bg-light hover:bg-gray-100 rounded-sm border border-brand-border transition-colors cursor-pointer"
              >
                Close Panel [ESC]
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-thin">
              
              {/* Google Sheets Connection Step */}
              <div className="bg-brand-bg-light/40 border border-brand-border/60 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-brand-accent flex items-center gap-1.5 uppercase font-mono tracking-wide">
                    Step 1: Link Google Workspace Admin Account
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed max-w-lg">
                    Connect your Google account with spreadsheets verification privileges. The applet will append active whitelist registrations with permission from you as the admin.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {googleUser ? (
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-brand-border shadow-sm">
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-brand-accent leading-none">{googleUser.displayName || "Admin Account"}</span>
                        <span className="text-[10px] text-brand-muted leading-relaxed truncate max-w-[180px]">{googleUser.email}</span>
                      </div>
                      <button 
                        onClick={handleGoogleLogout}
                        className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Sign Out"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGoogleSignIn}
                      className="cursor-pointer bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                    >
                      <PlusCircle size={15} />
                      Sign In with Google
                    </button>
                  )}
                </div>
              </div>

              {/* Spreadsheet configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Spreadsheet ID configuration */}
                <div className="space-y-4 border border-brand-border rounded-lg p-5 bg-white">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-brand-accent uppercase">// STEP 2: ASSIGN SPREADSHEET TARGET</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider font-mono">Active Spreadsheet Target ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter existing spreadsheet ID"
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
                      className="block w-full px-3 py-3 border border-brand-border rounded-sm bg-brand-bg-light/30 text-xs font-mono focus:outline-none focus:border-brand-accent placeholder:text-brand-muted"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-muted font-mono uppercase">Or create new:</span>
                    <button 
                      disabled={!googleUser || isExporting}
                      onClick={handleCreateSpreadsheet}
                      className="cursor-pointer text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
                    >
                      <PlusCircle size={13} />
                      Create spreadsheet auto-link
                    </button>
                  </div>

                  {spreadsheetUrl && (
                    <div className="pt-2">
                      <a 
                        href={spreadsheetUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs text-brand-accent font-semibold hover:underline"
                      >
                        Open Linked Google Sheet
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Submissions syncing panel */}
                <div className="space-y-4 border border-brand-border rounded-lg p-5 bg-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold tracking-wider text-brand-accent uppercase">// STEP 3: EXPORT & SYNC STATUS</h4>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-brand-muted">Current registrations in DB:</span>
                      <span className="text-xs font-mono font-bold text-brand-accent bg-brand-bg-light pr-2 pl-2 pt-0.5 pb-0.5 border border-brand-border rounded-sm">
                        {submissions.length} Entries
                      </span>
                    </div>

                    <p className="text-[11px] text-brand-muted leading-relaxed mt-2.5">
                      Exporting will safely overwrite Sheet1 contents starting at row A2, while keeping Row 1 labels completely intact.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    {syncStatus !== "idle" && (
                      <div className={`p-3 rounded border text-xs leading-normal font-mono ${
                        syncStatus === "success" 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}>
                        {syncStatus === "success" ? "✓ " : "⚠️ "} {statusMessage}
                      </div>
                    )}

                    <button 
                      disabled={!googleUser || !spreadsheetId || isExporting}
                      onClick={handleSyncToSheets}
                      className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-sm transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent disabled:cursor-not-allowed border border-transparent shadow-sm"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          Sending entries to Sheets...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet size={15} />
                          Push All Submissions to Google Sheets
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Submissions table preview */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-brand-accent uppercase flex items-center gap-1.5">
                    <Database size={13} />
                    Current User Whitelist Entries
                  </h4>
                  <button 
                    onClick={fetchSubmissions}
                    disabled={isLoadingSubmissions}
                    className="cursor-pointer text-xs font-mono text-brand-primary/80 hover:text-brand-accent flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={isLoadingSubmissions ? "animate-spin" : ""} />
                    Refresh Tables
                  </button>
                </div>

                <div className="border border-brand-border rounded-lg overflow-hidden bg-white max-h-[250px] overflow-y-auto">
                  {submissions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-brand-muted font-mono uppercase">
                      No whitelist registrations saved in sqlite database yet.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-bg-light border-b border-brand-border text-brand-muted uppercase font-mono text-[10px] tracking-wider select-none">
                          <th className="py-3 px-4">User Wallet (ID)</th>
                          <th className="py-3 px-4">Twitter Handle</th>
                          <th className="py-3 px-4">Invite Link</th>
                          <th className="py-3 px-4">FCFS Wallet</th>
                          <th className="py-3 px-4">WL Wallet</th>
                          <th className="py-3 px-4">GTD Wallet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {submissions.map((sub, idx) => {
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

                          return (
                            <tr key={idx} className="hover:bg-brand-bg-light/30 transition-colors">
                              <td className="py-3 px-4 font-mono font-semibold" title={sub.walletAddress}>
                                {sub.walletAddress ? `${sub.walletAddress.slice(0, 6)}...${sub.walletAddress.slice(-4)}` : "N/A"}
                              </td>
                              <td className="py-3 px-4">{sub.twitterUsername || "N/A"}</td>
                              <td className="py-3 px-4 truncate max-w-[120px]">{sub.inviteLink || "N/A"}</td>
                              <td className="py-3 px-4 font-mono truncate max-w-[100px]" title={fcfs}>
                                {fcfs ? `${fcfs.slice(0, 5)}...` : "N/A"}
                              </td>
                              <td className="py-3 px-4 font-mono truncate max-w-[100px]" title={wl}>
                                {wl ? `${wl.slice(0, 5)}...` : "N/A"}
                              </td>
                              <td className="py-3 px-4 font-mono truncate max-w-[100px]" title={gtd}>
                                {gtd ? `${gtd.slice(0, 5)}...` : "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
