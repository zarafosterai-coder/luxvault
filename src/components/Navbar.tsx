import { Key, Menu, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useWallet } from "./WalletContext";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { walletAddress, connectWallet, loading } = useWallet();

  return (
    <nav className="w-full border-b border-brand-border bg-brand-bg-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <span className="font-bold text-xl tracking-widest text-brand-primary uppercase">LuxVault</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-2">
              WL STAGES
            </a>
            <a href="#" className="text-sm font-medium tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
              CHECK
            </a>
            <a href="#" className="text-sm font-medium tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
              PREVIEW
            </a>
            <a href="#" className="text-sm font-medium tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
              DOCS
            </a>
          </div>

          {/* Connect Button (Desktop) */}
          <div className="hidden md:block">
            <button 
              disabled={loading}
              onClick={walletAddress ? undefined : connectWallet}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-sm font-medium transition-colors border ${walletAddress ? 'bg-brand-bg-light text-brand-primary border-brand-border cursor-default' : 'bg-brand-accent hover:bg-brand-accent-hover text-brand-bg-light border-transparent'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'CONNECT WALLET'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-brand-primary hover:text-brand-accent"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-bg-light border-b border-brand-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col gap-4">
            <a href="#" className="block px-3 py-2 text-base font-semibold text-brand-primary">WL STAGES</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-brand-muted">CHECK</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-brand-muted">PREVIEW</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-brand-muted">DOCS</a>
            <button 
              disabled={loading}
              onClick={() => { if (!walletAddress) connectWallet(); setIsMobileMenuOpen(false); }}
              className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-sm font-medium ${walletAddress ? 'bg-brand-bg-light text-brand-primary border border-brand-border cursor-default' : 'bg-brand-accent text-brand-bg-light'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'CONNECT WALLET'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
