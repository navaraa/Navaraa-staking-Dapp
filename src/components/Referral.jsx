// src/components/Referral.jsx
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from "../lib/constants";

export default function Referral() {
  const { address, isConnected } = useAccount();
  const [referrer, setReferrer] = useState("");
  const [referees, setReferees] = useState([]);
  const [count, setCount] = useState(0);

  const fetchReferralData = async () => {
    if (!isConnected) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

      const ref = await contract.referrerOf(address);
      setReferrer(ref);

      const refCount = await contract.refereesCount(address);
      setCount(refCount.toNumber());

      const refs = [];
      for (let i = 0; i < refCount; i++) {
        const r = await contract.refereesOf(address, i);
        refs.push(r);
      }
      setReferees(refs);
    } catch (err) {
      console.error("Error fetching referral data:", err);
    }
  };

  useEffect(() => {
    fetchReferralData();
    const interval = setInterval(fetchReferralData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [address, isConnected]);

  if (!isConnected) return <div className="p-4 bg-gray-800 rounded-md">Connect wallet to see referral info</div>;

  return (
    <div className="p-4 bg-gray-800 rounded-md space-y-2">
      <h2 className="text-lg font-bold text-purple-400">Referral Info</h2>
      <div>Your Referrer: {referrer}</div>
      <div>Total Referees: {count}</div>
      <div className="space-y-1">
        {referees.map((r, idx) => (
          <div key={idx} className="bg-gray-700 p-2 rounded">
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}
