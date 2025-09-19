// src/components/StakeForm.jsx
import React, { useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from "../lib/constants";

export default function StakeForm() {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState("");
  const [status, setStatus] = useState("");

  const handleStake = async () => {
    if (!signer) return;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setStatus("Enter valid amount");
      return;
    }

    try {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      const tx = await contract.stakeTokens(ethers.utils.parseEther(amount), referrer || "0x0000000000000000000000000000000000000000");
      setStatus("Transaction pending...");
      await tx.wait();
      setStatus("Staked successfully!");
      setAmount("");
      setReferrer("");
    } catch (err) {
      console.error(err);
      setStatus("Transaction failed");
    }
  };

  if (!isConnected) return <div className="p-4 bg-gray-800 rounded-md">Connect wallet to stake tokens</div>;

  return (
    <div className="p-4 bg-gray-800 rounded-md space-y-3">
      <h2 className="text-lg font-bold text-purple-400">Stake Tokens</h2>
      <input
        type="text"
        placeholder="Amount to stake"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <input
        type="text"
        placeholder="Referrer address (optional)"
        value={referrer}
        onChange={(e) => setReferrer(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <button
        onClick={handleStake}
        className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
      >
        Stake
      </button>
      {status && <div className="text-sm mt-1">{status}</div>}
    </div>
  );
}
