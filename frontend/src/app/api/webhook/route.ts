import { AdsType } from "@/app/types/AdsType";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Error verifying Stripe webhook signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      console.log("🎉 PAYMENT SUCCESSFUL!");

      // Extract your data from Stripe metadata
      const adData = JSON.parse(session.metadata?.adData || "{}");
      const userToken = session.metadata?.userToken ?? "";

      // Add this to actually handle the successful payment
      await handleSuccessfulPayment(adData, userToken);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(adData: AdsType, userToken: string) {
  try {
    const response = await fetch(
      `${process.env.ADS_SERVICE_URL}/api/ads/create/${adData.ledId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          mediaUrl: adData.mediaUrl,
          type: adData.type,
          duration: adData.duration,
          displayTime: adData.displayTime,
          pricePerSecond: adData.pricePerSecond,
          totalCost: adData.totalCost,
          status: "pending",
          billingStatus: "paid",
          createdAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.error("❌ API Error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
      return;
    }

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Response is not JSON. Content-Type:", contentType);
      const responseText = await response.text();
      console.error("❌ Response body:", responseText);
      return;
    }

    const data = await response.json();
    console.log("✅ Payment Data Sent Successfully:", data);
  } catch (e) {
    console.error("❌ Error handling successful payment:", e);
  }
}
