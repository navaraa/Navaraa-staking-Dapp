// src/App.jsx
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Dashboard from "./components/Dashboard";
import StakeForm from "./components/StakeForm";
import StakesList from "./components/StakesList";
import Referral from "./components/Referral";
import Admin from "./components/Admin";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-purple-400">
          Navaraa Staking dApp
        </h1>
        <ConnectButton showBalance={false} />
      </header>

      {/* Main content */}
      <main className="p-4 grid gap-6 max-w-5xl mx-auto">
        <Dashboard />
        <StakeForm />
        <StakesList />
        <Referral />
        <Admin />
      </main>
    </div>
  );
}

