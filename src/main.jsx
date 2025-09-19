// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import {
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import App from "./App";
import "./index.css";

// ✅ Configure chains
const { chains, publicClient } = configureChains(
  [polygon],
  [publicProvider()]
);

// ✅ Wallet setup
const { connectors } = getDefaultWallets({
  appName: "Navaraa Staking dApp",
  chains,
});

// ✅ Wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// ✅ Render app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
