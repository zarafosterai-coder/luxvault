import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";

export function LiveStats() {
  const [totalSupply, setTotalSupply] = useState("1111");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await apiClient.getCampaignConfig();
        if (config && config.totalSupply) {
          setTotalSupply(config.totalSupply);
        }
      } catch (err) {
        console.error("Failed to load campaign config in stats:", err);
      }
    };
    fetchConfig();
  }, []);

  const stats = [
    {
      title: "WL STAGES",
      value: "3/3",
      subtext: "Stages Live",
      action: "VIEW",
      active: true
    },
    {
      title: "FCFS STATUS",
      value: "Live Now",
      action: "VIEW",
      active: true
    },
    {
      title: "WL STATUS",
      value: "Open for Verified",
      action: "VIEW",
      active: true
    },
    {
      title: "TOTAL SUPPLY",
      value: totalSupply,
      subtext: "LuxVault WL",
      active: false
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-brand-border/60">
      
      <div className="mb-10">
        <p className="text-xs font-mono tracking-widest text-brand-accent uppercase mb-3">// COLLECTION STATUS</p>
        <h2 className="text-4xl md:text-5xl font-serif text-brand-primary font-bold tracking-tight mb-4">
          Live Stats
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-brand-border rounded-xl p-6 relative group overflow-hidden hover:border-brand-accent/30 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-semibold tracking-widest text-brand-primary uppercase font-mono">{stat.title}</span>
              {stat.action && (
                <button className="text-[10px] font-semibold tracking-widest text-brand-accent uppercase bg-brand-accent/10 px-2 py-0.5 rounded-sm border border-brand-accent/20 hover:bg-brand-accent hover:text-white transition-colors">
                  {stat.action}
                </button>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-brand-primary tracking-tight">
                {stat.value}
              </span>
              {stat.subtext && (
                <span className="text-xs text-brand-muted font-medium">{stat.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
