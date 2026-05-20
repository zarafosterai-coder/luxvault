import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Column */}
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-border rounded-full text-xs font-mono text-brand-accent font-medium tracking-wide">
            <span>GENESIS DROP</span>
            <span className="w-1 h-1 rounded-full bg-brand-primary-light/30"></span>
            <span>BY @LILHUBCAT</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-brand-accent tracking-tighter leading-[1.1]">
            <span className="block text-brand-primary font-serif">LuxVault</span>
            WL Terminal
          </h1>
          
          <p className="text-lg md:text-xl text-brand-primary/80 max-w-md">
            1111 LuxVault WL. Free mint.
          </p>

          <button className="mt-4 bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light px-8 py-4 rounded-sm flex items-center gap-3 font-medium tracking-wide transition-all group">
            CLAIM YOUR PIXEL WL
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 flex items-center gap-8 font-mono text-sm border-t border-brand-border pt-6 w-full max-w-sm">
             <div className="flex flex-col">
               <span className="text-brand-primary font-bold text-lg">1111</span>
               <span className="text-brand-muted text-xs uppercase tracking-wider">Total</span>
             </div>
             <div className="flex flex-col">
               <span className="text-brand-primary font-bold text-lg">Free Mint</span>
               <span className="text-brand-muted text-xs uppercase tracking-wider">Price</span>
             </div>
          </div>
        </div>

        {/* Right Column - NFT Card */}
        <div className="relative w-full max-w-md mx-auto lg:ml-auto">
          {/* Subtle drop shadow/glow behind card */}
          <div className="absolute inset-0 bg-brand-accent/5 blur-3xl rounded-full transform scale-95 translate-y-4"></div>
          
          <div className="relative bg-white border border-brand-border rounded-xl shadow-xl overflow-hidden p-6 md:p-8 flex flex-col gap-6">
            
            {/* Card Header */}
            <div className="flex justify-between items-center text-sm font-semibold tracking-widest text-brand-primary uppercase">
              <span>LuxVault</span>
              <div className="flex items-center gap-2 text-xs font-mono text-brand-primary">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Online
              </div>
            </div>

            {/* Card Stats Grid */}
            <div className="grid grid-cols-2 gap-4 gap-y-6">
              <div>
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">Collection</p>
                <p className="font-semibold text-brand-primary">LuxVault</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">Type</p>
                <p className="font-semibold text-brand-primary">LuxVault WL</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">Total Supply</p>
                <p className="font-semibold text-brand-primary">1111</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">Mint Price</p>
                <p className="font-semibold text-brand-primary">Free</p>
              </div>
              <div className="bg-brand-bg-light/50 p-2 -ml-2 rounded-sm">
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">Mint Status</p>
                <p className="font-semibold text-brand-primary">Free Mint</p>
              </div>
              <div className="bg-brand-bg-light/50 p-2 -ml-2 rounded-sm">
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">WL Status</p>
                <p className="font-semibold text-brand-primary relative inline-flex items-center">
                  Pending
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-brand-accent/30 block"></span>
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
