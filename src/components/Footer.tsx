import { useState, useEffect } from "react";
import { Key, Loader2 } from "lucide-react";
import { useWallet } from "./WalletContext";
import { apiClient } from "../lib/apiClient";

interface FooterProps {
  data?: {
    logoText?: string;
    tagline?: string;
    copyright?: string;
  };
}

export function Footer({ data }: FooterProps) {
  const { walletAddress, connectWallet, loading } = useWallet();
  const [config, setConfig] = useState({
    totalSupply: "1111",
    mintPrice: "Free Mint"
  });

  const logoText = data?.logoText || "LuxVault";
  const tagline = data?.tagline || `${config.totalSupply} LuxVault WL. ${config.mintPrice}.`;
  const copyright = data?.copyright || "© LuxVault. All Rights Reserved.";

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getCampaignConfig();
        if (data) {
          setConfig({
            totalSupply: data.totalSupply || "1111",
            mintPrice: data.mintPrice || "Free Mint"
          });
        }
      } catch (err) {
        console.error("Failed to load footer campaign config:", err);
      }
    };
    load();
  }, []);

  return (
    <footer className="w-full bg-brand-bg-dark border-t border-brand-bg-light/10 text-brand-bg-light py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl tracking-widest uppercase">{logoText}</span>
            </div>
            <p className="text-sm font-mono text-brand-bg-light/60">
              {tagline}
            </p>
            <p className="text-xs font-mono text-brand-bg-light/40 mt-2">
              {copyright}
            </p>
          </div>

          {/* Center Message */}
          <div className="flex justify-center text-center max-w-sm mx-auto">
            <p className="text-xs font-mono text-brand-accent leading-relaxed">
              This is a test collection that will grant you entry to our onchain raffle where you can win prizes. Total prize pool value $15,000
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <button 
              disabled={loading}
              onClick={walletAddress ? undefined : connectWallet}
              className={`flex items-center gap-2 px-8 py-3 rounded-sm font-medium transition-colors border ${walletAddress ? 'bg-brand-bg-light/10 text-brand-bg-light border-brand-border cursor-default' : 'bg-brand-accent hover:bg-brand-accent-hover text-brand-bg-light border-transparent'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'CONNECT WALLET'}
            </button>

            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-2 text-xs font-mono tracking-wider text-brand-accent hover:text-white transition-colors">
                 <span>𝕏</span> (TWITTER)
              </a>
              <a href="#" className="flex items-center gap-2 text-xs font-mono tracking-wider text-brand-accent hover:text-white transition-colors">
                 <span className="text-base leading-none">⍢</span> DISCORD
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
