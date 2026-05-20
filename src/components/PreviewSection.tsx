import { Lock, Settings, LayoutTemplate, Palette, MonitorPlay } from "lucide-react";

export function PreviewSection() {
  const menuItems = [
    { icon: <LayoutTemplate size={18} />, label: "Background & Theme" },
    { icon: <Settings size={18} />, label: "Signal Effects" },
    { icon: <Palette size={18} />, label: "Animation Style" },
    { icon: <MonitorPlay size={18} />, label: "Preview Mode" },
  ];

  return (
    <section className="w-full bg-brand-bg-dark text-brand-bg-light relative overflow-hidden py-24">
      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-bg-light font-bold tracking-tight mb-4">
                Preview your LuxVault signal
              </h2>
              <p className="text-brand-bg-light/70 text-lg">
                Customize your terminal. Reveal your signal.
              </p>
            </div>

            <div className="flex flex-col gap-6 mt-4">
              {menuItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-brand-bg-light/60 hover:text-brand-accent cursor-pointer transition-colors w-fit">
                  {item.icon}
                  <span className="font-mono text-sm tracking-wide">{item.label}</span>
                  <Lock size={14} className="ml-2 opacity-50" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Locked Card */}
          <div className="relative w-full max-w-sm mx-auto lg:ml-auto">
            {/* The Locked Card outline */}
            <div className="aspect-[3/4] rounded-2xl border border-brand-bg-light/10 bg-brand-bg-light/5 relative overflow-hidden backdrop-blur-sm flex flex-col items-center justify-center p-8 group">
              
              {/* Top left text */}
              <div className="absolute top-6 left-6 text-xs font-semibold tracking-widest text-brand-bg-light/40 uppercase">
                LuxVault
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-6 left-6 text-xs font-mono tracking-widest text-brand-bold text-brand-bg-light/40 uppercase">
                Coming Soon
              </div>

              {/* Center Lock Message */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-brand-bg-light/20 flex flex-col items-center justify-center bg-brand-bg-dark">
                  <Lock size={18} className="text-brand-bg-light/60" />
                </div>
                <div className="text-center">
                   <p className="font-bold tracking-wider text-brand-bg-light uppercase">Coming Soon</p>
                   <p className="text-xs text-brand-bg-light/50 font-mono mt-1">Signal preview unlocks at mint</p>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
