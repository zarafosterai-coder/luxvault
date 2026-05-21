import { Key, Menu, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useWallet } from "./WalletContext";

interface NavbarProps {
  data?: {
    logoText?: string;
    links?: Array<{ id: string; label: string; href: string }>;
    buttonText?: string;
    buttonSize?: 'sm' | 'md' | 'lg';
    buttonEffect?: 'solid' | 'gradient' | 'outline';
  };
}

export function Navbar({ data }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { walletAddress, connectWallet, loading } = useWallet();

  const logoText = data?.logoText || "LuxVault";
  const links = data?.links || [
    { "id": "l1", "label": "WL STAGES", "href": "#stages" },
    { "id": "l2", "label": "CHECK", "href": "#checker" },
    { "id": "l3", "label": "PREVIEW", "href": "#preview" },
    { "id": "l4", "label": "DOCS", "href": "#docs" }
  ];
  const buttonText = data?.buttonText || "CONNECT WALLET";
  const buttonSize = data?.buttonSize || "md";
  const buttonEffect = data?.buttonEffect || "solid";

  // Size Tailwind mapper
  const sizeClasses = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  }[buttonSize] || "px-6 py-2.5 text-sm";

  // Effect Tailwind mapper
  const effectClasses = {
    solid: "bg-brand-accent hover:bg-brand-accent/80 text-brand-bg-light border-transparent",
    gradient: "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black font-bold border-transparent",
    outline: "bg-transparent hover:bg-teal-500/10 text-teal-400 border-teal-500/40 hover:border-teal-500"
  }[buttonEffect] || "bg-brand-accent hover:bg-brand-accent/80 text-brand-bg-light border-transparent";

  return (
    <nav className="w-full border-b border-brand-border bg-brand-bg-light/75 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <span className="font-bold text-xl tracking-widest text-brand-primary uppercase">{logoText}</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <a 
                key={link.id} 
                href={link.href} 
                className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Connect Button (Desktop) */}
          <div className="hidden md:block">
            <button 
              disabled={loading}
              onClick={walletAddress ? undefined : connectWallet}
              className={`flex items-center gap-2 rounded-sm font-medium transition-colors border ${walletAddress ? 'bg-brand-bg-light text-brand-primary border-brand-border cursor-default px-6 py-2.5' : `${sizeClasses} ${effectClasses}`}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : buttonText}
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
        <div className="md:hidden bg-brand-bg-light/90 backdrop-blur-md border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col gap-4">
            {links.map((link) => (
              <a 
                key={link.id} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-brand-primary"
              >
                {link.label}
              </a>
            ))}
            <button 
              disabled={loading}
              onClick={() => { if (!walletAddress) connectWallet(); setIsMobileMenuOpen(false); }}
              className={`flex items-center justify-center gap-2 w-full rounded-sm font-medium ${walletAddress ? 'bg-brand-bg-light text-brand-primary border border-brand-border cursor-default py-3' : `py-3 ${effectClasses}`}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : buttonText}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
