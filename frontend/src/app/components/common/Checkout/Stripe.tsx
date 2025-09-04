"use client";

import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface AdData {
  ledId: string;
  mediaUrl: string;
  type: string;
  duration: number;
  displayTime: {
    startTime: string;
    endTime: string;
  };
  pricePerSecond: number;
  totalCost: number;
}

export default function CheckoutButton({
  orderId,
  amount,
  adTitle,
  adData,
  userToken,
  disabled = false,
  onValidate,
}: {
  orderId: string;
  amount: number;
  adTitle: string;
  adData: AdData;
  userToken?: string;
  disabled?: boolean;
  onValidate?: () => boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    // Run validation before proceeding
    if (onValidate && !onValidate()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userToken && { Authorization: `Bearer ${userToken}` }),
        },
        body: JSON.stringify({
          orderId,
          amount,
          adTitle,
          adData,
          userToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading || amount <= 0}
      className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)} & Create Ad`}
    </Button>
  );
}
