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

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin-dashboard';

  return (
    <WalletProvider>
      {isAdminRoute ? (
        <AdminDashboard />
      ) : (
        <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-bg-light">
          <Navbar />
          <main className="flex-grow">
            <Hero />
            <WLStages />
            <WLChecker />
            <LiveStats />
            <PreviewSection />
          </main>
          <Footer />
        </div>
      )}
    </WalletProvider>
  );
}

