// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, TOKEN_ADDRESS } from "../lib/constants";
import { ethers } from "ethers";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [tokenBalance, setTokenBalance] = useState("0");
  const [pendingReward, setPendingReward] = useState("0");

  // Fetch pending rewards every 1 second
  useEffect(() => {
    if (!isConnected) return;

    let interval;
    const fetchRewards = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ["function balanceOf(address) view returns (uint256)"], provider);

        // Token balance
        const bal = await tokenContract.balanceOf(address);
        setTokenBalance(ethers.utils.formatEther(bal));

        // Pending rewards
        const totalPending = await stakingContract.totalPendingRewards(address);
        setPendingReward(ethers.utils.formatEther(totalPending));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchRewards();
    interval = setInterval(fetchRewards, 1000);

    return () => clearInterval(interval);
  }, [address, isConnected]);

  if (!isConnected) return <div className="p-4 bg-gray-800 rounded-md">Connect wallet to see dashboard</div>;

  return (
    <div className="p-4 bg-gray-800 rounded-md space-y-2">
      <h2 className="text-lg font-bold text-purple-400">Dashboard</h2>
      <div>Wallet: {address}</div>
      <div>Token Balance: {tokenBalance}</div>
      <div>Pending Rewards: {pendingReward}</div>
    </div>
  );
}

