import React from "react"
import ReactDOM from "react-dom/client"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"

import App from "./App"
import { AudioProvider } from "./context/AudioContext"

import "@solana/wallet-adapter-react-ui/styles.css"
import "./index.css"

/*
  Network
  You can change to "mainnet-beta" when ready
*/
const endpoint = clusterApiUrl("mainnet-beta")

const wallets = [new PhantomWalletAdapter()]

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
)