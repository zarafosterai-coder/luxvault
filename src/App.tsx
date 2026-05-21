/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WLStages } from './components/WLStages';
import { WLChecker } from './components/WLChecker';
import { LiveStats } from './components/LiveStats';
import { PreviewSection } from './components/PreviewSection';
import { Footer } from './components/Footer';
import { WalletProvider } from './components/WalletContext';
import { AdminDashboard } from './components/AdminDashboard';
import { apiClient } from './lib/apiClient';

const defaultLayout = [
  { id: "navbar", enabled: true, title: "Navigation Header" },
  { id: "hero", enabled: true, title: "Hero Presentation" },
  { id: "wlstages", enabled: true, title: "Whitelist Stages Tracker" },
  { id: "wlchecker", enabled: true, title: "Eligibility Checker Card" },
  { id: "livestats", enabled: true, title: "Real-time Metrics Dash" },
  { id: "preview", enabled: true, title: "Animated Terminal Preview" },
  { id: "footer", enabled: true, title: "Footer Metadata Hub" },
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [layout, setLayout] = useState<any[]>([]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Check for pathname changes periodically to support quick navigation actions
    const interval = setInterval(handleLocationChange, 1000);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const data = await apiClient.getCMSLayout();
        if (Array.isArray(data) && data.length > 0) {
          setLayout(data);
        } else {
          setLayout(defaultLayout);
        }
      } catch (err) {
        console.error("Failed to load CMS layout in App.tsx", err);
        setLayout(defaultLayout);
      }
    };
    fetchLayout();
  }, [currentPath]);

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin-dashboard';

  const activeSections = layout.length > 0 ? layout : defaultLayout;
  const navbarSection = activeSections.find(s => s.id === "navbar");
  const footerSection = activeSections.find(s => s.id === "footer");
  const mainSections = activeSections.filter(s => s.id !== "navbar" && s.id !== "footer");

  return (
    <WalletProvider>
      {isAdminRoute ? (
        <AdminDashboard />
      ) : (
        <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-bg-light">
          {navbarSection?.enabled !== false && <Navbar data={navbarSection} />}
          <main className="flex-grow">
            {mainSections.map(sec => {
              if (sec.enabled === false) return null;
              switch (sec.id) {
                case "hero": return <Hero key="hero" data={sec} />;
                case "wlstages": return <WLStages key="wlstages" data={sec} />;
                case "wlchecker": return <WLChecker key="wlchecker" data={sec} />;
                case "livestats": return <LiveStats key="livestats" data={sec} />;
                case "preview": return <PreviewSection key="preview" data={sec} />;
                default: return null;
              }
            })}
          </main>
          {footerSection?.enabled !== false && <Footer data={footerSection} />}
        </div>
      )}
    </WalletProvider>
  );
}

