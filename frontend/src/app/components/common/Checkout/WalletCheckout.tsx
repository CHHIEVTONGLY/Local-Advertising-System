"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AdsType } from "@/app/types/AdsType";
import { useRouter } from "next/navigation";

export default function WalletCheckout({
  orderId,
  amount,
  adData,
  adTitle,
  userToken,
  disabled = false,
  onValidate,
  onSuccess,
  onError,
}: {
  orderId: string;
  amount: number;
  adData: AdsType;
  adTitle: string;
  userToken: string;
  disabled?: boolean;
  onValidate?: () => boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/wallets/me", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        const data = await res.json();
        setBalance(data.wallet?.balance ?? 0);
      } catch {
        console.error("Failed to fetch wallet balance.");
      }
    };
    fetchBalance();
  }, [userToken]);

  const handleWalletCheckout = async () => {
    if (onValidate && !onValidate()) return;
    if (balance === null || balance < amount) {
      if (onError) {
        onError("Insufficient wallet balance.");
      }
      return;
    }

    try {
      setIsLoading(true);
      const walletResponse = await fetch("/api/wallets/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ amount }),
      });
      if (walletResponse.ok) {
        // Step 1: Move file from temp to permanent location
        const moveFileResponse = await fetch("/api/ads/move-to-permanent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adData: {
              tempKey: adData.tempKey,
              fileName: adData.fileName,
            },
            orderId,
          }),
        });

        if (!moveFileResponse.ok) {
          throw new Error("Failed to move file to permanent location");
        }
        const moveFileData = await moveFileResponse.json();
        const permanentMediaUrl = moveFileData.mediaUrl;

        // Step 2: Create the ad
        const adsResponse = await fetch(`/api/ads/create/${adData.ledId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            adTitle,
            permanentMediaUrl,
            adData,
            orderId,
          }),
        });

        if (adsResponse.ok) {
          router.push("/payment/success");
        } else {
          router.push(`/payment/refund?amount=${adData.totalCost}`);
        }
      }
    } catch {
      if (onError) {
        onError("Payment failed or was cancelled.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleWalletCheckout}
      disabled={disabled || isLoading || amount <= 0}
      className="w-full rounded-md px-4 py-2 font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)} With Wallet`}
    </Button>
  );
}
