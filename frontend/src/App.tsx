import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { AudioProvider } from './components/audio/AudioManager';

import "@solana/wallet-adapter-react-ui/styles.css";

import HomePage from "./components/HomePage";
import DevWatch from "./components/DevWatch";
import { GameProvider } from "./context/GameContext";

function App() {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => {
    return import.meta.env.VITE_RPC_URL ?? clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // Super-light routing (no react-router):
  // - /devwatch -> DevWatch stream UI
  // - everything else -> normal app
  const page = useMemo(() => {
    const path = window.location.pathname || "/";
    if (path.toLowerCase().startsWith("/devwatch")) return "devwatch";
    return "home";
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AudioProvider>
            <GameProvider>
              {page === "devwatch" ? <DevWatch /> : <HomePage />}
            </GameProvider>
          </AudioProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;