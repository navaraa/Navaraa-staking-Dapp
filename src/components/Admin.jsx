// src/components/Admin.jsx
import React, { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from "../lib/constants";

export default function Admin() {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const [owner, setOwner] = useState("");
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");

  const fetchAdminData = async () => {
    if (!signer) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

      const contractOwner = await contract.owner();
      setOwner(contractOwner);

      const isPaused = await contract.paused();
      setPaused(isPaused);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [signer]);

  if (!isConnected) return <div className="p-4 bg-gray-800 rounded-md">Connect wallet to access admin panel</div>;

  if (address.toLowerCase() !== owner.toLowerCase()) return null;

  const togglePause = async () => {
    if (!signer) return;
    try {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      const tx = paused ? await contract.unpause() : await contract.pause();
      setStatus("Transaction pending...");
      await tx.wait();
      setStatus(paused ? "Unpaused successfully" : "Paused successfully");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      setStatus("Transaction failed");
    }
  };

  const rescueTokens = async (tokenAddress, amount) => {
    if (!signer) return;
    try {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      const tx = await contract.rescueERC20(tokenAddress, ethers.utils.parseEther(amount));
      setStatus("Transaction pending...");
      await tx.wait();
      setStatus("Tokens rescued successfully");
    } catch (err) {
      console.error(err);
      setStatus("Transaction failed");
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md space-y-3">
      <h2 className="text-lg font-bold text-purple-400">Admin Panel</h2>
      <div>Owner: {owner}</div>
      <div>Status: {paused ? "Paused" : "Active"}</div>
      <button
        className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        onClick={togglePause}
      >
        {paused ? "Unpause Contract" : "Pause Contract"}
      </button>

      <div className="mt-3 space-y-2">
        <h3 className="font-semibold">Rescue Tokens</h3>
        <RescueForm rescueTokens={rescueTokens} />
      </div>

      {status && <div className="mt-2">{status}</div>}
    </div>
  );
}

// Separate component for rescue form
function RescueForm({ rescueTokens }) {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");

  const handleRescue = () => {
    if (!token || !amount) return;
    rescueTokens(token, amount);
    setToken("");
    setAmount("");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
      <input
        type="text"
        placeholder="Token address"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white flex-1"
      />
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white flex-1"
      />
      <button
        className="px-3 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
        onClick={handleRescue}
      >
        Rescue
      </button>
    </div>
  );
}

