import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
  console.log("🚀 Checkout - Starting payment session");

  // Add adData and userToken here
  const { orderId, amount, adTitle, adData, userToken } = await req.json();

  console.log("📦 Checkout - Received data:", {
    orderId,
    amount,
    adTitle,
    ledId: adData?.ledId,
    hasUserToken: !!userToken,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Ad Payment: ${adTitle}` },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${req.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.nextUrl.origin}/payment/cancel`,
    metadata: {
      orderId,
      adData: JSON.stringify(adData), // Store form data
      userToken: userToken || "", // Store user token
    },
  });

  console.log("✅ Checkout - Session created:", session.id);

  return NextResponse.json({ sessionId: session.id, url: session.url });
}
