/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WLStages } from './components/WLStages';
import { WLChecker } from './components/WLChecker';
import { LiveStats } from './components/LiveStats';
import { PreviewSection } from './components/PreviewSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
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
  );
}

