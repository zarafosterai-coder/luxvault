import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("connectedWallet");
    if (saved) {
      setWalletAddress(saved);
    }
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet/connect", { method: "POST" });
      const data = await res.json();
      if (data.success && data.walletAddress) {
        setWalletAddress(data.walletAddress);
        localStorage.setItem("connectedWallet", data.walletAddress);
      }
    } catch (e) {
      console.error("Failed to connect wallet", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet, loading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
