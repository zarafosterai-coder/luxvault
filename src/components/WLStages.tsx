import { Heart, Link as LinkIcon, RefreshCw, UserCircle, MessageSquare, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useWallet } from "./WalletContext";

interface TaskProps {
  label: string;
  placeholder?: string;
  icon: React.ReactNode;
  isInput?: boolean;
  value?: string;
  onClick?: () => void;
  verified?: boolean;
  href?: string;
}

const Task = ({ label, placeholder, icon, isInput = true, value, onClick, verified, href }: TaskProps) => (
  <div className="flex flex-col gap-2 mb-5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold tracking-wider text-brand-primary uppercase font-mono">{label}</label>
      {verified && <span className="text-[10px] flex items-center gap-1 text-green-500 font-bold tracking-widest uppercase"><CheckCircle2 size={12}/> Verified</span>}
    </div>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-accent">
        {icon}
      </div>
      {isInput ? (
        <input 
          type="text" 
          defaultValue={value}
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
  </div>
);

export function WLStages() {
  const { walletAddress } = useWallet();
  const [loadingAction, setLoadingAction] = useState(false);
  const [verifiedActions, setVerifiedActions] = useState({ liked: false, retweeted: false, replied: false });
  const targetPostUrl = "https://x.com/LuxVaultAI/status/1855172174308425951";

  const handleVerify = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    
    try {
      setLoadingAction(true);
      const res = await fetch("/api/campaigns/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      });
      const data = await res.json();
      if (res.status === 500 && data.error) {
        alert("Server Error: " + data.error);
      } else if (data.needsConnection) {
        alert("Not connected to X. Please connect.");
      } else if (data.success) {
        setVerifiedActions(data.verified);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-brand-bg-dark text-brand-bg-light border-y border-brand-border/60">
      
      {/* Section Header */}
      <div className="mb-12">
        <p className="text-xs font-mono tracking-widest text-brand-accent uppercase mb-3">// WHITELIST ALLOCATION</p>
        <h2 className="text-4xl md:text-5xl font-serif text-brand-primary font-bold tracking-tight mb-4 text-white">
          WL Stages
        </h2>
        <p className="text-white">Stages unlock sequentially. Pass verification before allocation.</p>
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
            Interact with our post to qualify. Like, retweet, and drop your wallet.
          </p>

          <div className="flex-grow">
            <Task href={targetPostUrl} verified={verifiedActions.liked} label="LIKE THE POST" placeholder="OPEN AND LIKE POST" icon={<Heart size={16} />} isInput={false} />
            <Task href={targetPostUrl} verified={verifiedActions.retweeted} label="REPOST THE POST" placeholder="OPEN AND REPOST" icon={<RefreshCw size={16} />} isInput={false} />
            <Task href={targetPostUrl} verified={verifiedActions.replied} label="DROP WALLET IN COMMENTS" placeholder="OPEN AND COMMENT" icon={<MessageSquare size={16} />} isInput={false} />
            <Task label="YOUR WALLET ADDRESS" placeholder="0x..." icon={<UserCircle size={16} />} value={walletAddress || ""} verified={!!walletAddress} />
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border">
            <button onClick={handleVerify} disabled={loadingAction} className="flex justify-center items-center gap-2 w-full bg-brand-primary hover:bg-brand-primary-light disabled:opacity-75 text-brand-bg-light font-semibold tracking-wide py-4 rounded-sm transition-colors text-sm">
              {loadingAction ? <Loader2 size={16} className="animate-spin" /> : null}
              VERIFY INTERACTIONS
            </button>
            <p className="text-center text-xs text-brand-muted mt-4 font-mono">Open to all • FCFS allocation</p>
          </div>
        </div>

        {/* WL Card */}
        <div className="bg-brand-bg-light border border-brand-border rounded-xl p-6 md:p-8 flex flex-col relative opacity-90">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-xl pointer-events-none z-10"></div>
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

          <div className="flex-grow relative z-20">
            <Task href={targetPostUrl} label="POST QUOTE TWEET ABOUT LUXVAULT" placeholder="QUOTE TWEET" icon={<MessageSquare size={16} />} isInput={false} />
            <Task label="POST INVITATION (DISCORD/X)" placeholder="YOUR INVITE LINK" icon={<LinkIcon size={16} />} isInput={false} />
            <Task label="POST EXCLUSIVE COOL ART" placeholder="Drop art link" icon={<LinkIcon size={16} />} />
            <Task label="YOUR FCFS-APPROVED WALLET" placeholder="0x...wallet address" icon={<UserCircle size={16} />} value={walletAddress || ""} verified={!!walletAddress} />
            <Task label="YOUR X (TWITTER) USERNAME" placeholder="@yourhandle" icon={<UserCircle size={16} />} />
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border relative z-20">
            <p className="text-xs font-mono text-brand-muted mb-4">// EXTRA LEVELS (OPTIONAL)<br/>More actions, bigger allocation.</p>
            <button disabled className="w-full bg-brand-primary text-brand-bg-light font-semibold tracking-wide py-4 rounded-sm transition-colors text-sm opacity-50 cursor-not-allowed">
              SUBMIT FOR WL
            </button>
            <p className="text-center text-xs text-brand-muted mt-4 font-mono">WL only • Verified members</p>
          </div>
        </div>

        {/* GTD Card */}
        <div className="bg-white border border-brand-border rounded-xl p-6 md:p-8 flex flex-col shadow-sm relative opacity-90">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] rounded-xl pointer-events-none z-10"></div>
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

          <div className="flex-grow relative z-20">
            <Task href={targetPostUrl} label="OPEN THE POST" placeholder="OPEN THE POST" icon={<LinkIcon size={16} />} isInput={false} />
            <Task href={targetPostUrl} label="LIKE THE POST" placeholder="LIKE THE POST" icon={<Heart size={16} />} isInput={false} />
            <Task href={targetPostUrl} label="QUOTE + RETWEET THE POST WITH CELEBRATION" placeholder="QUOTE TWEET" icon={<MessageSquare size={16} />} isInput={false} />
            <Task label="CONNECT UNDER THE POST & DROP YOUR WALLET" placeholder="0x.. WALLET ADDRESS" icon={<UserCircle size={16} />} isInput={false} />
            <Task label="YOUR X (TWITTER) USERNAME" placeholder="@yourhandle" icon={<UserCircle size={16} />} />
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border relative z-20">
            <button disabled className="w-full bg-brand-primary text-brand-bg-light font-semibold tracking-wide py-4 rounded-sm transition-colors text-sm opacity-50 cursor-not-allowed">
              SUBMIT FOR GTD
            </button>
            <p className="text-center text-xs text-brand-muted mt-4 font-mono">Guaranteed • Highest allocation</p>
          </div>
        </div>

      </div>
    </section>
  );
}
