"use client";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { WalletType } from "@/app/types/WalletType";

export default function WalletDisplay() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      const response = await fetch("/api/wallets/me");
      const data: WalletType = await response.json();
      setBalance(data.wallet.balance);
      setLoading(false);
    };
    fetchWallet();
  }, []);

  return (
    <div className="inline-flex items-center h-[40px] bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow">
      <Wallet className="w-3.5 h-3.5 mr-1" />
      {loading ? (
        <span className="animate-pulse bg-gray-600 rounded w-8 h-4 inline-block" />
      ) : (
        <>${balance}</>
      )}
    </div>
  );
}
