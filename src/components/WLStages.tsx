import { Heart, Link as LinkIcon, RefreshCw, UserCircle, MessageSquare, CheckCircle2, Loader2, ArrowRight, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import { apiClient } from "../lib/apiClient";

interface TaskProps {
  label: string;
  placeholder?: string;
  icon: React.ReactNode;
  isInput?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  onClick?: () => void;
  verified?: boolean;
  href?: string;
  actionButton?: React.ReactNode;
}

const Task = ({ label, placeholder, icon, isInput = true, value, onChange, onClick, verified, href, actionButton }: TaskProps) => (
  <div className="flex flex-col gap-2 mb-5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold tracking-wider text-brand-primary uppercase font-mono">{label}</label>
      {verified && <span className="text-[10px] flex items-center gap-1 text-green-500 font-bold tracking-widest uppercase"><CheckCircle2 size={12}/> Verified</span>}
    </div>
    <div className="flex items-center gap-2">
      <div className="relative group flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-accent">
          {icon}
        </div>
        {isInput ? (
          <input 
            type="text" 
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            disabled={verified}
            className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-sm bg-brand-bg-light/50 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors placeholder:text-brand-muted/70 disabled:opacity-70 disabled:bg-gray-100"
          />
        ) : (
          <a 
            href={href || "#"} 
            target="_blank" 
            rel="noreferrer"
            onClick={onClick}
            className="w-full flex items-center justify-between pl-10 pr-4 py-3 border border-brand-border rounded-sm bg-brand-bg-light/30 text-sm hover:bg-brand-bg-light transition-colors text-brand-accent font-medium text-left"
          >
            <span>{placeholder}</span>
            <ArrowRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
      </div>
      {actionButton}
    </div>
  </div>
);

export function WLStages() {
  const { walletAddress } = useWallet();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [verifiedActions, setVerifiedActions] = useState({ follow: false, retweet: false, tweet: false });
  const [xConnected, setXConnected] = useState(false);
  const [xConnecting, setXConnecting] = useState(false);

  const [formState, setFormState] = useState({
    walletAddressFCFS: "",
    walletAddressWL: "",
    walletAddressGTD: "",
    twitterUsername: "",
    inviteLink: "",
    artLink: "",
    quoteTweetUrl: "",
    commentUrl: ""
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [initialLoading, setInitialLoading] = useState(false);
  
  const targetPostUrl = "https://x.com/LuxVault_/status/2054056009291980861?s=20";
  const targetAccount = "LuxVault_";
  const requiredText = "@LuxVault_";

  const saveSubmissionToBackend = async (stateToSave: typeof formState) => {
    if (!walletAddress) return;
    try {
      setSaveStatus("saving");
      
      const serializedWallets = JSON.stringify({
        fcfs: stateToSave.walletAddressFCFS,
        wl: stateToSave.walletAddressWL,
        gtd: stateToSave.walletAddressGTD
      });

      const { success } = await apiClient.saveSubmission(walletAddress, {
        savedWalletAddress: serializedWallets,
        twitterUsername: stateToSave.twitterUsername,
        inviteLink: stateToSave.inviteLink,
        artLink: stateToSave.artLink,
        quoteTweetUrl: stateToSave.quoteTweetUrl,
        commentUrl: stateToSave.commentUrl
      });

      if (success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
    }
  };

  useEffect(() => {
    if (!walletAddress) {
      setFormState({
        walletAddressFCFS: "",
        walletAddressWL: "",
        walletAddressGTD: "",
        twitterUsername: "",
        inviteLink: "",
        artLink: "",
        quoteTweetUrl: "",
        commentUrl: ""
      });
      setXConnected(false);
      setVerifiedActions({ follow: false, retweet: false, tweet: false });
      return;
    }

    setInitialLoading(true);

    const loadSubmission = async () => {
      try {
        const { success, submission: sub } = await apiClient.getSubmission(walletAddress);
        if (success && sub) {
          let fcfs = walletAddress;
          let wl = "";
          let gtd = "";

          if (sub.savedWalletAddress) {
            try {
              const parsedWallets = JSON.parse(sub.savedWalletAddress);
              fcfs = parsedWallets.fcfs || walletAddress;
              wl = parsedWallets.wl || "";
              gtd = parsedWallets.gtd || "";
            } catch (e) {
              fcfs = sub.savedWalletAddress || walletAddress;
            }
          } else if (sub.walletAddress) {
            // support standard backend naming format compatibility
            try {
              const parsedWallets = JSON.parse(sub.walletAddress);
              fcfs = parsedWallets.fcfs || walletAddress;
              wl = parsedWallets.wl || "";
              gtd = parsedWallets.gtd || "";
            } catch (e) {
              fcfs = sub.walletAddress || walletAddress;
            }
          }

          setFormState({
            walletAddressFCFS: fcfs,
            walletAddressWL: wl,
            walletAddressGTD: gtd,
            twitterUsername: sub.twitterUsername || "",
            inviteLink: sub.inviteLink || "",
            artLink: sub.artLink || "",
            quoteTweetUrl: sub.quoteTweetUrl || "",
            commentUrl: sub.commentUrl || ""
          });

          if (sub.twitterUsername) {
            setXConnected(true);
          }

          setVerifiedActions({
            follow: !!sub.verifiedFollow,
            retweet: !!sub.verifiedRetweet,
            tweet: !!sub.verifiedTweet
          });
        } else {
          setFormState(prev => ({
            ...prev,
            walletAddressFCFS: walletAddress
          }));
        }
      } catch (err) {
        console.error("Failed to load submission:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSubmission();
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress || initialLoading) return;
    
    const hasData = Object.values(formState).some(val => val !== "");
    if (!hasData) return;

    const timer = setTimeout(() => {
      saveSubmissionToBackend(formState);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formState, walletAddress, initialLoading]);

  const handleConnectX = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    
    try {
      setXConnecting(true);
      const data = await apiClient.connectX(walletAddress);
      if (data.connected) {
        setXConnected(true);
        // Prompt username fill locally
        setFormState(prev => {
          const updated = { ...prev };
          if (!updated.twitterUsername) {
            updated.twitterUsername = "@lux_user";
          }
          return updated;
        });
      } else {
        alert("Failed to connect X.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setXConnecting(false);
    }
  };

  const handleVerifyFollow = async () => {
    if (!xConnected || !walletAddress) return alert("Connect X and Wallet first");
    
    try {
      setLoadingAction("follow");
      const data = await apiClient.verifyFollow(walletAddress, targetAccount);
      if (data.verified) {
        setVerifiedActions(prev => ({ ...prev, follow: true }));
      } else {
        alert("Follow not verified yet. Try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerifyRetweet = async () => {
    if (!xConnected || !walletAddress) return alert("Connect X and Wallet first");
    
    try {
      setLoadingAction("retweet");
      const data = await apiClient.verifyRetweet(walletAddress, targetPostUrl);
      if (data.verified) {
        setVerifiedActions(prev => ({ ...prev, retweet: true }));
      } else {
        alert("Retweet not verified yet. Try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerifyTweet = async () => {
    if (!xConnected || !walletAddress) return alert("Connect X and Wallet first");
    
    try {
      setLoadingAction("tweet");
      const data = await apiClient.verifyTweet(walletAddress, requiredText);
      if (data.verified) {
        setVerifiedActions(prev => ({ ...prev, tweet: true }));
      } else {
        alert("Tweet not verified yet. Try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section id="wl-stages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-brand-bg-dark text-brand-bg-light border-y border-brand-border/60">
      
      {/* Section Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono tracking-widest text-brand-accent uppercase mb-3">// WHITELIST ALLOCATION</p>
          {saveStatus === "saving" && <span className="text-xs text-brand-accent/80 animate-pulse font-mono flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Auto-saving...</span>}
          {saveStatus === "saved" && <span className="text-xs text-green-400 font-mono flex items-center gap-1.5">✓ Progress saved</span>}
          {saveStatus === "error" && <span className="text-xs text-red-400 font-mono flex items-center gap-1.5">Error auto-saving</span>}
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-brand-primary font-bold tracking-tight mb-4 text-white">
          WL Stages
        </h2>
        <p className="text-white">Stages unlock sequentially. Pass verification before allocation.</p>
        
        <div className="mt-8">
          <button 
            disabled={xConnected || xConnecting}
            onClick={handleConnectX}
            className={`flex items-center gap-2 px-6 py-3 rounded-sm font-semibold tracking-wide transition-colors ${xConnected ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-black text-white hover:bg-gray-800 border border-gray-700'}`}
          >
            {xConnecting ? <Loader2 size={16} className="animate-spin" /> : <Twitter size={18} />}
            {xConnected ? "X (Twitter) Connected" : "Connect X Account"}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FCFS Card */}
        <div className="bg-white border border-brand-border rounded-xl p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-baseline gap-3">
               <span className="text-2xl font-serif text-brand-accent font-bold">01</span>
               <h3 className="text-2xl font-bold text-brand-primary tracking-tight">FCFS</h3>
               <span className="bg-brand-accent/10 text-brand-accent text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider border border-brand-accent/20">Active</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-mono text-brand-primary font-medium">
               Live <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
             </div>
          </div>
          
          <p className="text-sm text-brand-primary/80 mb-8 min-h-[40px]">
            Follow, Retweet, and Post to qualify for your allocation.
          </p>

          <div className="flex-grow">
            <Task 
              href={`https://x.com/${targetAccount}`} 
              verified={verifiedActions.follow} 
              label="FOLLOW ACCOUNT" 
              placeholder={`Follow @${targetAccount}`} 
              icon={<UserCircle size={16} />} 
              isInput={false} 
              actionButton={
                <button onClick={handleVerifyFollow} disabled={verifiedActions.follow || loadingAction === "follow"} className="px-4 py-3 bg-brand-bg-dark text-brand-bg-light text-sm font-bold rounded-sm whitespace-nowrap min-w-[90px] flex justify-center">
                  {loadingAction === "follow" ? <Loader2 size={16} className="animate-spin" /> : (verifiedActions.follow ? "Done" : "Verify")}
                </button>
              }
            />
            <Task 
              href={targetPostUrl} 
              verified={verifiedActions.retweet} 
              label="RETWEET ANNOUNCEMENT" 
              placeholder="Open and Retweet" 
              icon={<RefreshCw size={16} />} 
              isInput={false} 
              actionButton={
                <button onClick={handleVerifyRetweet} disabled={verifiedActions.retweet || loadingAction === "retweet"} className="px-4 py-3 bg-brand-bg-dark text-brand-bg-light text-sm font-bold rounded-sm whitespace-nowrap min-w-[90px] flex justify-center">
                  {loadingAction === "retweet" ? <Loader2 size={16} className="animate-spin" /> : (verifiedActions.retweet ? "Done" : "Verify")}
                </button>
              }
            />
            <Task 
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(`I'm securing my spot for ${requiredText} 🚀 ${targetPostUrl}`)}`} 
              verified={verifiedActions.tweet} 
              label="POST REQUIRED TWEET" 
              placeholder="Post tweet about us" 
              icon={<MessageSquare size={16} />} 
              isInput={false} 
              actionButton={
                <button onClick={handleVerifyTweet} disabled={verifiedActions.tweet || loadingAction === "tweet"} className="px-4 py-3 bg-brand-bg-dark text-brand-bg-light text-sm font-bold rounded-sm whitespace-nowrap min-w-[90px] flex justify-center">
                  {loadingAction === "tweet" ? <Loader2 size={16} className="animate-spin" /> : (verifiedActions.tweet ? "Done" : "Verify")}
                </button>
              }
            />
            <Task 
              label="YOUR WALLET ADDRESS" 
              placeholder="0x..." 
              icon={<UserCircle size={16} />} 
              value={formState.walletAddressFCFS} 
              onChange={(val) => setFormState(prev => ({ ...prev, walletAddressFCFS: val }))}
              verified={!!walletAddress} 
            />
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border">
            <button 
              disabled={!walletAddress || !verifiedActions.follow || !verifiedActions.retweet || !verifiedActions.tweet}
              onClick={() => {
                alert("Allocation claimed successfully!");
              }}
              className={`flex justify-center items-center gap-2 w-full bg-brand-primary text-brand-bg-light font-semibold tracking-wide py-4 rounded-sm transition-colors text-sm ${(!walletAddress || !verifiedActions.follow || !verifiedActions.retweet || !verifiedActions.tweet) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary-light'}`}
            >
              CLAIM ALLOCATION
            </button>
            <p className="text-center text-xs text-brand-muted mt-4 font-mono">Open to all • FCFS allocation</p>
          </div>
        </div>

        {/* WL Card */}
        <div className={`bg-brand-bg-light border border-brand-border rounded-xl p-6 md:p-8 flex flex-col relative transition-opacity duration-300 ${walletAddress ? 'opacity-100' : 'opacity-90'}`}>
          {!walletAddress && <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-xl pointer-events-none z-10"></div>}
          <div className="flex justify-between items-start mb-6 relative z-20">
             <div className="flex items-baseline gap-3">
               <span className="text-2xl font-serif text-brand-accent font-bold">02</span>
               <h3 className="text-2xl font-bold text-brand-primary tracking-tight">WL</h3>
               <span className="bg-brand-muted/10 text-brand-primary text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider border border-brand-border">Pending</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-mono text-brand-muted font-medium">
               Locked <span className="w-1.5 h-1.5 rounded-full bg-brand-muted"></span>
             </div>
          </div>
          
          <p className="text-sm text-brand-primary/80 mb-8 min-h-[40px] relative z-20">
            Verified WL only. Extra points don't affect allocation.
          </p>

          <div className={`flex-grow relative z-20 transition-opacity ${walletAddress ? 'opacity-100' : 'opacity-50'}`}>
            <Task 
              label="POST QUOTE TWEET URL" 
              placeholder="https://x.com/... status link" 
              icon={<MessageSquare size={16} />} 
              isInput={true}
              value={formState.quoteTweetUrl}
              onChange={(val) => setFormState(prev => ({ ...prev, quoteTweetUrl: val }))}
            />
            <Task 
              label="POST INVITATION" 
              placeholder="YOUR INVITE LINK" 
              icon={<LinkIcon size={16} />} 
              isInput={true}
              value={formState.inviteLink}
              onChange={(val) => setFormState(prev => ({ ...prev, inviteLink: val }))}
            />
            <Task 
              label="POST EXCLUSIVE ART" 
              placeholder="Drop art link" 
              icon={<LinkIcon size={16} />} 
              isInput={true}
              value={formState.artLink}
              onChange={(val) => setFormState(prev => ({ ...prev, artLink: val }))}
            />
            <Task 
              label="WL WALLET ADDRESS" 
              placeholder="0x... WL wallet address" 
              icon={<UserCircle size={16} />} 
              isInput={true}
              value={formState.walletAddressWL}
              onChange={(val) => setFormState(prev => ({ ...prev, walletAddressWL: val }))}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border relative z-20">
            <p className="text-xs font-mono text-brand-muted mb-4">// EXTRA LEVELS (OPTIONAL)<br/>More actions, bigger allocation.</p>
            <button 
              onClick={() => {
                saveSubmissionToBackend(formState);
                alert("Whitelist submission updated and saved to database!");
              }}
              disabled={!walletAddress}
              className={`w-full bg-brand-primary text-brand-bg-light font-semibold tracking-wide py-4 rounded-sm transition-colors text-sm ${!walletAddress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary-light'}`}
            >
              SUBMIT FOR WL
            </button>
            <p className="text-center text-xs text-brand-muted mt-4 font-mono">WL only • Verified members</p>
          </div>
        </div>

        {/* GTD Card */}
        <div className={`bg-white border border-brand-border rounded-xl p-6 md:p-8 flex flex-col shadow-sm relative transition-opacity duration-300 ${walletAddress ? 'opacity-100' : 'opacity-90'}`}>
          {!walletAddress && <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] rounded-xl pointer-events-none z-10"></div>}
          <div className="flex justify-between items-start mb-6 relative z-20">
             <div className="flex items-baseline gap-3">
               <span className="text-2xl font-serif text-brand-accent font-bold">03</span>
               <h3 className="text-2xl font-bold text-brand-primary tracking-tight">GTD</h3>
               <span className="bg-brand-muted/10 text-brand-primary text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider border border-brand-border">Pending</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-mono text-brand-muted font-medium">
               Locked <span className="w-1.5 h-1.5 rounded-full bg-brand-muted"></span>
             </div>
          </div>
          
          <p className="text-sm text-brand-primary/80 mb-8 min-h-[40px] relative z-20">
            Guaranteed allocation. More activity, higher rank.
          </p>

          <div className={`flex-grow relative z-20 transition-opacity ${walletAddress ? 'opacity-100' : 'opacity-50'}`}>
            <Task href={targetPostUrl} label="OPEN THE POST" placeholder="OPEN THE POST" icon={<LinkIcon size={16} />} isInput={false} />
            <Task href={targetPostUrl} label="LIKE THE POST" placeholder="LIKE THE POST" icon={<Heart size={16} />} isInput={false} />
            <Task 
              label="COMMENT URL" 
              placeholder="Paste comment URL" 
              icon={<MessageSquare size={16} />} 
              isInput={true}
              value={formState.commentUrl}
              onChange={(val) => setFormState(prev => ({ ...prev, commentUrl: val }))}
            />
            <Task 
              label="YOUR TWITTER USERNAME" 
              placeholder="@handle" 
              icon={<UserCircle size={16} />} 
              isInput={true}
              value={formState.twitterUsername}
              onChange={(val) => setFormState(prev => ({ ...prev, twitterUsername: val }))}
            />
            <Task 
              label="GTD WALLET ADDRESS" 
              placeholder="0x... GTD wallet address" 
              icon={<UserCircle size={16} />} 
              isInput={true}
              value={formState.walletAddressGTD}
              onChange={(val) => setFormState(prev => ({ ...prev, walletAddressGTD: val }))}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border relative z-20">
            <button 
              onClick={() => {
                saveSubmissionToBackend(formState);
                alert("Guaranteed distribution form submitted and saved to database!");
              }}
              disabled={!walletAddress}
              className={`w-full bg-brand-primary text-brand-bg-light font-semibold tracking-wide py-4 rounded-sm transition-colors text-sm ${!walletAddress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary-light'}`}
            >
              SUBMIT FOR GTD
            </button>
            <p className="text-center text-xs text-brand-muted mt-4 font-mono">Guaranteed • Highest allocation</p>
          </div>
        </div>

      </div>
    </section>
  );
}

