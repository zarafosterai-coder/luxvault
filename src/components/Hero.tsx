import { ArrowRight } from "lucide-react";

interface HeroProps {
  data?: {
    tagline?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonSize?: 'sm' | 'md' | 'lg';
    buttonEffect?: 'solid' | 'gradient' | 'outline';
    buttonHref?: string;
    stats?: Array<{ label: string; value: string }>;
    columnLayout?: 'one-col' | 'two-col';
  };
}

export function Hero({ data }: HeroProps) {
  const tagline = data?.tagline || "GENESIS DROP BY @LuxVault_";
  const title = data?.title || "THE SIGNAL SECURED SYSTEM";
  const subtitle = data?.subtitle || "1111 LuxVault WL. Free mint.";
  const buttonText = data?.buttonText || "CLAIM TEST DROP WL";
  const buttonSize = data?.buttonSize || "lg";
  const buttonEffect = data?.buttonEffect || "solid";
  const buttonHref = data?.buttonHref || "#stages";
  const stats = data?.stats || [
    { "label": "Total Supply", "value": "1111" },
    { "label": "Mint Price", "value": "Free Mint" }
  ];
  const columnLayout = data?.columnLayout || "two-col";

  // Size Tailwind mapping
  const sizeClasses = {
    sm: "px-5 py-2.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  }[buttonSize] || "px-8 py-4 text-sm";

  // Effect Tailwind mapping
  const effectClasses = {
    solid: "bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light border-transparent",
    gradient: "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black font-semibold border-transparent",
    outline: "bg-transparent hover:bg-brand-primary/5 text-brand-primary border-brand-primary/50 hover:border-brand-primary"
  }[buttonEffect] || "bg-brand-primary hover:bg-brand-primary-light text-brand-bg-light border-transparent";

  const handleButtonClick = () => {
    const id = buttonHref.startsWith("#") ? buttonHref.slice(1) : buttonHref;
    const element = document.getElementById(id || "stages");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // Treat as relative link
      window.location.hash = buttonHref;
    }
  };

  if (columnLayout === "one-col") {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center justify-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-border rounded-full text-xs font-mono text-brand-accent font-medium tracking-wide">
          <span>{tagline}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-brand-accent tracking-tighter leading-[1.1] max-w-3xl">
          <span className="block text-brand-primary font-serif">{title}</span>
        </h1>
        
        <p className="text-lg md:text-xl text-brand-primary/80 max-w-2xl leading-relaxed">
          {subtitle}
        </p>

        <button 
          onClick={handleButtonClick}
          className={`${sizeClasses} ${effectClasses} rounded-sm flex items-center justify-center gap-3 font-medium tracking-wide transition-all group border`}
        >
          {buttonText}
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 flex items-center justify-center gap-12 font-mono text-sm border-t border-brand-border pt-6 w-full max-w-md">
          {stats.map((stat, i) => (
             <div key={i} className="flex flex-col items-center">
               <span className="text-brand-primary font-bold text-lg">{stat.value}</span>
               <span className="text-brand-muted text-xs uppercase tracking-wider">{stat.label}</span>
             </div>
          ))}
        </div>
      </section>
    );
  }

  // Two columns (default)
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Column */}
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-border rounded-full text-xs font-mono text-brand-accent font-medium tracking-wide">
            <span>{tagline}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-brand-accent tracking-tighter leading-[1.1]">
            <span className="block text-brand-primary font-serif">{title}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-brand-primary/80 max-w-md">
            {subtitle}
          </p>

          <button 
            onClick={handleButtonClick}
            className={`${sizeClasses} ${effectClasses} rounded-sm flex items-center gap-3 font-medium tracking-wide transition-all group border`}
          >
            {buttonText}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 flex items-center gap-8 font-mono text-sm border-t border-brand-border pt-6 w-full max-w-sm">
            {stats.map((stat, i) => (
               <div key={i} className="flex flex-col">
                 <span className="text-brand-primary font-bold text-lg">{stat.value}</span>
                 <span className="text-brand-muted text-xs uppercase tracking-wider">{stat.label}</span>
               </div>
            ))}
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
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">{stat.label}</p>
                  <p className="font-semibold text-brand-primary">{stat.value}</p>
                </div>
              ))}
              <div className="bg-brand-bg-light/50 p-2 -ml-2 rounded-sm">
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5">Mint Status</p>
                <p className="font-semibold text-brand-primary">{stats[1]?.value || "Live"}</p>
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
