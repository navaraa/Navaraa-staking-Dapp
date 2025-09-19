// src/components/StakesList.jsx
import React, { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from "../lib/constants";

export default function StakesList() {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStakes = async () => {
    if (!address) return;
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

      const count = await contract.stakeCount(address);
      const stakesArray = [];
      for (let i = 0; i < count; i++) {
        const stake = await contract.getStake(address, i);
        const pending = await contract.pendingRewardForStake(address, i);
        stakesArray.push({
          index: i,
          amount: ethers.utils.formatEther(stake.amount),
          startTime: new Date(stake.startTime.toNumber() * 1000).toLocaleString(),
          claimed: ethers.utils.formatEther(stake.claimed),
          principalWithdrawn: stake.principalWithdrawn,
          totalReward: ethers.utils.formatEther(stake.totalReward),
          pending: ethers.utils.formatEther(pending),
        });
      }
      setStakes(stakesArray);
    } catch (err) {
      console.error("Error fetching stakes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakes();
    const interval = setInterval(fetchStakes, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [address]);

  const claimRewards = async (index) => {
    if (!signer) return;
    try {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      const tx = await contract.claimStakingRewards([index]);
      await tx.wait();
      fetchStakes();
    } catch (err) {
      console.error(err);
    }
  };

  const withdrawPrincipal = async (index) => {
    if (!signer) return;
    try {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      const tx = await contract.withdrawPrincipal([index]);
      await tx.wait();
      fetchStakes();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isConnected) return <div className="p-4 bg-gray-800 rounded-md">Connect wallet to see your stakes</div>;

  return (
    <div className="p-4 bg-gray-800 rounded-md space-y-2">
      <h2 className="text-lg font-bold text-purple-400">Your Stakes</h2>
      {loading ? <div>Loading...</div> : null}
      {stakes.length === 0 && !loading ? <div>No stakes found</div> : null}
      <div className="space-y-2">
        {stakes.map((s) => (
          <div key={s.index} className="p-2 bg-gray-700 rounded flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
            <div>
              <div>Index: {s.index}</div>
              <div>Amount: {s.amount}</div>
              <div>Start: {s.startTime}</div>
              <div>Claimed: {s.claimed}</div>
              <div>Pending: {s.pending}</div>
              <div>Principal Withdrawn: {s.principalWithdrawn ? "Yes" : "No"}</div>
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              {!s.principalWithdrawn && (
                <>
                  <button
                    className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-sm"
                    onClick={() => claimRewards(s.index)}
                  >
                    Claim Rewards
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-sm"
                    onClick={() => withdrawPrincipal(s.index)}
                  >
                    Withdraw Principal
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
