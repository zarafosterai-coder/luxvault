import { Key, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-brand-border bg-brand-bg-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Simple CSS block logo to mimic pixel art */ }
            <div className="w-8 h-8 bg-brand-accent flex items-center justify-center rounded-sm">
              <div className="w-4 h-4 bg-brand-bg-light grid grid-cols-2 grid-rows-2 gap-[1px]">
                <div className="bg-brand-accent"></div>
                <div className="bg-brand-primary"></div>
                <div className="bg-brand-primary"></div>
                <div className="bg-brand-accent"></div>
              </div>
            </div>
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
              onClick={() => console.log("Connect Wallet Triggered")}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-brand-bg-light px-6 py-2.5 rounded-sm font-medium transition-colors border border-transparent"
            >
              <Key size={16} />
              CONNECT WALLET
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
              onClick={() => { console.log("Connect Wallet Triggered"); setIsMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full bg-brand-accent text-brand-bg-light px-6 py-3 rounded-sm font-medium"
            >
              <Key size={16} />
              CONNECT WALLET
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
