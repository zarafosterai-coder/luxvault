import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi";
import { config } from "../config";
import { X, Wallet, Loader2 } from "lucide-react";

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet?: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProviderInner>{children}</WalletProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function WalletProviderInner({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const walletAddress = isConnected && address ? address : null;

  const connectWallet = async () => {
    setShowConnectModal(true);
  };

  const disconnectWallet = () => {
    disconnect();
  };

  // Close modal automatically when connected
  useEffect(() => {
    if (isConnected) {
      setShowConnectModal(false);
      setConnectingId(null);
    }
  }, [isConnected]);

  return (
    <WalletContext.Provider 
      value={{ 
        walletAddress, 
        connectWallet, 
        disconnectWallet,
        loading: isConnecting || !!connectingId 
      }}
    >
      {children}

      {showConnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop overlay with luxury blur */}
          <div 
            onClick={() => { if (!connectingId) setShowConnectModal(false); }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
          ></div>

          {/* Modal Card */}
          <div className="relative bg-brand-bg-light border border-brand-border w-full max-w-sm rounded-[4px] p-6 md:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            {!connectingId && (
              <button 
                onClick={() => setShowConnectModal(false)}
                className="absolute top-4 right-4 text-brand-muted hover:text-brand-primary p-1.5 transition-colors"
                id="close-connect-modal"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-brand-accent/15 rounded-full flex items-center justify-center text-brand-accent mb-3">
                <Wallet size={20} />
              </div>
              <h3 className="text-lg font-serif font-bold text-brand-primary uppercase tracking-wider">Connect Wallet</h3>
              <p className="text-slate-500 text-xs mt-1">Choose a wallet connector from below</p>
            </div>

            {/* Connectors List */}
            <div className="flex flex-col gap-3">
              {connectors.map((connector) => {
                const isConnectingThis = connectingId === connector.uid;
                
                return (
                  <button
                    key={connector.uid}
                    id={`wallet-connector-${connector.id}`}
                    disabled={!!connectingId}
                    onClick={() => {
                      setConnectingId(connector.uid);
                      connect(
                        { connector },
                        {
                          onError: (err) => {
                            console.error("Connect error:", err);
                            setConnectingId(null);
                          }
                        }
                      );
                    }}
                    className="flex items-center justify-between w-full p-4 border border-brand-border rounded-sm bg-brand-bg-light/50 hover:bg-brand-bg-light transition-all text-sm font-semibold tracking-wide text-brand-primary disabled:opacity-50 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-brand-border bg-white flex items-center justify-center font-mono text-xs text-brand-accent group-hover:scale-105 transition-transform">
                        {connector.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-brand-primary uppercase">{connector.name}</div>
                        <div className="text-[9px] text-brand-muted uppercase font-mono tracking-wider">
                          {connector.id === "injected" ? "BROWSER EXTENSION" : connector.id.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isConnectingThis ? (
                        <span className="flex items-center gap-1 text-xs text-brand-accent font-mono animate-pulse">
                          <Loader2 size={12} className="animate-spin" />
                          CONNECTING...
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-xs bg-brand-accent/5">
                          SELECT
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-sm text-[11px] text-center font-mono leading-relaxed">
                {error.message || "Failed to establish wallet connection"}
              </div>
            )}
            
            {/* Disclaimer */}
            <p className="text-center text-[10px] text-brand-muted mt-6 font-mono font-medium max-w-[240px] mx-auto leading-relaxed">
              By connecting, you agree to our Terms of Service & Privacy Policy.
            </p>

          </div>
        </div>
      )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
