import { useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import { apiClient, WLSubmission } from "../lib/apiClient";
import { CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react";

interface WLCheckerProps {
  data?: {
    heading?: string;
    description?: string;
  };
}

export function WLChecker({ data }: WLCheckerProps) {
  const { walletAddress } = useWallet();
  const [searchAddress, setSearchAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookedUp, setLookedUp] = useState(false);
  const [result, setResult] = useState<WLSubmission | null>(null);

  const heading = data?.heading || "WL Checker";
  const description = data?.description || "Look up your wallet to see your current status across all stages instantly.";

  useEffect(() => {
    if (walletAddress) {
      setSearchAddress(walletAddress);
    }
  }, [walletAddress]);

  const handleCheck = async () => {
    if (!searchAddress.trim()) {
      alert("Please enter a valid wallet address.");
      return;
    }
    setLoading(true);
    setLookedUp(false);
    try {
      const resp = await apiClient.getSubmission(searchAddress.trim());
      if (resp.success && resp.submission && (resp.submission.twitterUsername || resp.submission.savedWalletAddress)) {
        setResult(resp.submission);
      } else {
        setResult(null);
      }
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
      setLookedUp(true);
    }
  };

  // Helper to check if FCFS is completed
  const hasFCFS = (sub: WLSubmission) => {
    return !!(sub.verifiedFollow || sub.verifiedRetweet || sub.verifiedTweet || sub.twitterUsername);
  };

  // Helper to check if WL is completed
  const hasWL = (sub: WLSubmission) => {
    if (sub.savedWalletAddress) {
      try {
        const parsed = JSON.parse(sub.savedWalletAddress);
        return !!parsed.wl;
      } catch (e) {}
    }
    return !!sub.commentUrl; // simple heuristic
  };

  // Helper to check if GTD is completed
  const hasGTD = (sub: WLSubmission) => {
    if (sub.savedWalletAddress) {
      try {
        const parsed = JSON.parse(sub.savedWalletAddress);
        return !!parsed.gtd;
      } catch (e) {}
    }
    return !!sub.commentUrl; // simple heuristic
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side */}
        <div>
          <p className="text-xs font-mono tracking-widest text-brand-accent uppercase mb-3">// ALLOCATION STATUS</p>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-primary font-bold tracking-tight mb-4">
            {heading}
          </h2>
          <p className="text-brand-primary/70 text-lg max-w-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Right Side - Checker Form */}
        <div className="bg-white border border-brand-border rounded-xl p-8 shadow-sm">
          <label className="block text-xs font-semibold tracking-wider text-brand-primary uppercase font-mono mb-3">
            ENTER WALLET ADDRESS
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="0x... wallet address"
              className="flex-grow px-4 py-4 border border-brand-border rounded-sm bg-brand-bg-light/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors text-sm font-mono"
            />
            <button 
              id="check-status-btn"
              disabled={loading}
              onClick={handleCheck}
              className="bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light px-8 py-4 rounded-sm font-medium tracking-wide transition-colors whitespace-nowrap min-w-[150px] text-[11px] font-mono flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  LOADING...
                </>
              ) : (
                <>
                  <Search size={12} />
                  CHECK STATUS
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs font-mono text-brand-muted">
            <span>Secure lookup</span>
            <span className="w-1 h-1 bg-brand-border rounded-full"></span>
            <span>No wallet connection required</span>
          </div>

          {/* Results Block */}
          {lookedUp && (
            <div className="mt-8 pt-6 border-t border-brand-border animate-in fade-in slide-in-from-bottom-2 duration-200">
              {result ? (
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">RECORDS LOCATED</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Stage 1 FCFS */}
                    <div className="flex items-center justify-between p-3 border border-brand-border/60 rounded-sm bg-brand-bg-light/20">
                      <div>
                        <div className="text-xs font-bold text-brand-primary uppercase">01. STAGE FCFS ALLOCATION</div>
                        <div className="text-[10px] text-brand-muted font-mono uppercase mt-0.5">Open to all members</div>
                      </div>
                      <div>
                        {hasFCFS(result) ? (
                          <span className="text-[10px] font-mono font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm">
                            ALLOCATED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-brand-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm">
                            NOT REGISTERED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage 2 WL */}
                    <div className="flex items-center justify-between p-3 border border-brand-border/60 rounded-sm bg-brand-bg-light/20">
                      <div>
                        <div className="text-xs font-bold text-brand-primary uppercase">02. STAGE WL SUBMISSION</div>
                        <div className="text-[10px] text-brand-muted font-mono uppercase mt-0.5">Whitelist qualified members</div>
                      </div>
                      <div>
                        {hasWL(result) ? (
                          <span className="text-[10px] font-mono font-bold text-brand-accent bg-brand-accent/5 border border-brand-accent/20 px-2 py-0.5 rounded-sm">
                            SUBMITTED & PERSISTED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-brand-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm">
                            NOT SUBMITTED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage 3 GTD */}
                    <div className="flex items-center justify-between p-3 border border-brand-border/60 rounded-sm bg-brand-bg-light/20">
                      <div>
                        <div className="text-xs font-bold text-brand-primary uppercase">03. STAGE GTD ALLOCATION</div>
                        <div className="text-[10px] text-brand-muted font-mono uppercase mt-0.5">Guaranteed allocation</div>
                      </div>
                      <div>
                        {hasGTD(result) ? (
                          <span className="text-[10px] font-mono font-bold text-brand-accent bg-brand-accent/5 border border-brand-accent/20 px-2 py-0.5 rounded-sm">
                            SUBMITTED & PERSISTED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-brand-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm">
                            NOT SUBMITTED
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 border border-dashed border-brand-border rounded-sm bg-brand-bg-light/25">
                  <AlertCircle size={16} className="text-brand-muted mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-brand-primary uppercase">NO ALLOCATION REGISTRATION FOUND</div>
                    <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                      We couldn't locate any whitelisting history for {searchAddress.slice(0, 8)}...{searchAddress.slice(-6)}. Fill out the WL Stages below to secure your spot.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
