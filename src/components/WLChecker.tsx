export function WLChecker() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side */}
        <div>
          <p className="text-xs font-mono tracking-widest text-brand-accent uppercase mb-3">// ALLOCATION STATUS</p>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-primary font-bold tracking-tight mb-4">
            WL Checker
          </h2>
          <p className="text-brand-primary/70 text-lg max-w-sm">
            Look up your wallet to see your current status across all stages.
          </p>
        </div>

        {/* Right Side - Checker Form */}
        <div className="bg-white border border-brand-border rounded-xl p-8 shadow-sm">
          <label className="block text-xs font-semibold tracking-wider text-brand-primary uppercase font-mono mb-3">ENTER WALLET ADDRESS</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="0x... wallet address"
              className="flex-grow px-4 py-4 border border-brand-border rounded-sm bg-brand-bg-light/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors text-sm font-mono"
            />
            <button className="bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light px-8 py-4 rounded-sm font-medium tracking-wide transition-colors whitespace-nowrap w-[150px] text-[11px]">
              CHECK STATUS
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs font-mono text-brand-muted">
            <span>Secure lookup</span>
            <span className="w-1 h-1 bg-brand-border rounded-full"></span>
            <span>No wallet connection required</span>
          </div>
        </div>

      </div>
    </section>
  );
}
