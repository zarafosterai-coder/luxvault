import { Key } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-brand-bg-dark border-t border-brand-bg-light/10 text-brand-bg-light py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-accent flex items-center justify-center rounded-sm">
                <div className="w-4 h-4 bg-brand-bg-light grid grid-cols-2 grid-rows-2 gap-[1px]">
                  <div className="bg-brand-accent"></div>
                  <div className="bg-brand-primary"></div>
                  <div className="bg-brand-primary"></div>
                  <div className="bg-brand-accent"></div>
                </div>
              </div>
              <span className="font-bold text-xl tracking-widest uppercase">LuxVault</span>
            </div>
            <p className="text-sm font-mono text-brand-bg-light/60">
              1111 pixel unicorns. Free mint.
            </p>
            <p className="text-xs font-mono text-brand-bg-light/40 mt-2">
              © LuxVault. All Rights Reserved.
            </p>
          </div>

          {/* Center Message */}
          <div className="flex justify-center text-center">
            <p className="text-xs font-mono tracking-widest text-brand-accent uppercase">
              PIXEL ALLOCATION IS ETERNAL
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <button 
              onClick={() => console.log("Connect Wallet Triggered")}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-brand-bg-light px-8 py-3 rounded-sm font-medium transition-colors border border-transparent"
            >
              <Key size={16} />
              CONNECT WALLET
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
