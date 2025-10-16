import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const SECRET_KEY = process.env.SECRET_KEY!;

export async function POST(req: NextRequest) {
  // Add adData and userToken here
  const { orderId, amount, adTitle, adData, userToken } = await req.json();

  const decoded = jwt.verify(userToken, SECRET_KEY);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const userId = (decoded as { id: string }).id;

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
      publisherId: userId || "", // Store user token
      adTitle,
    },
  });

  return NextResponse.json({ sessionId: session.id, url: session.url });
}
