import { AdsType } from "@/app/types/AdsType";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const API_GATEWAY = process.env.API_GATEWAY_URL;

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
      const publisherId = session.metadata?.publisherId ?? "";
      const orderId = session.metadata?.orderId ?? "";
      const adTitle = session.metadata?.adTitle ?? "";

      // Handle the successful payment with file moving
      await handleSuccessfulPayment(
        adData,
        adTitle,
        publisherId,
        orderId,
        session.id
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(
  adData: AdsType,
  adTitle: string,
  publisherId: string,
  orderId: string,
  sessionId: string
) {
  try {
    console.log("🔄 Step 1: Moving file from temp to permanent storage...");

    // Step 1: Move file from temp to permanent location
    const moveFileResponse = await axios.post(
      `${API_GATEWAY}/api/ads/move-to-permanent`,
      {
        tempKey: adData.tempKey,
        fileName: adData.fileName,
        orderId: orderId,
        sessionId: sessionId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!moveFileResponse.data.mediaUrl) {
      throw new Error("Failed to get permanent media URL");
    }

    const permanentMediaUrl = moveFileResponse.data.mediaUrl;

    console.log(publisherId);
    // Step 2: Create the ad with permanent URL
    const createAdResponse = await fetch(
      `${API_GATEWAY}/api/ads/create/${adData.ledId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ads-key": process.env.SECRET_ADS_KEY || "",
        },
        body: JSON.stringify({
          title: adTitle,
          mediaUrl: permanentMediaUrl,
          type: adData.type,
          duration: adData.duration,
          displayTime: adData.displayTime,
          pricePerSecond: adData.pricePerSecond,
          totalCost: adData.totalCost,
          status: "pending",
          billingStatus: "paid",
          orderId: orderId,
          sessionId: sessionId,
          publisherId: publisherId,
          createdAt: new Date().toISOString(),
        }),
      }
    );

    if (!createAdResponse.ok) {
      console.error("❌ Failed to create ad:", createAdResponse.status);
      const errorText = await createAdResponse.text();
      console.error("❌ Error response:", errorText);

      // Refund to user
      await axios.post(
        `${API_GATEWAY}/api/wallets/deposit`,
        {
          amount: adData.totalCost,
          type: "refund",
          
        },
        {
          headers: {
            "x-wallet-key": process.env.SECRET_WALLET_KEY,
          },
        }
      );

      // If ad creation fails, we should clean up the permanent file
      await cleanupPermanentFile(permanentMediaUrl);
      return;
    }

    // Check if response is JSON
    const contentType = createAdResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Response is not JSON. Content-Type:", contentType);
      const responseText = await createAdResponse.text();
      console.error("❌ Response body:", responseText);
      return;
    }

    await createAdResponse.json();
  } catch (error) {
    console.error("❌ Error in payment processing:", error);

    // If there's an error, try to clean up temp file
    if (adData.tempKey) {
      await cleanupTempFile(adData.tempKey);
    }
  }
}

// Helper function to cleanup temp files if something goes wrong
async function cleanupTempFile(tempKey: string) {
  try {
    await axios.post(
      `${API_GATEWAY}/api/ads/cleanup-temp`,
      { tempKey },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Failed to cleanup temp file:", error);
  }
}

// Helper function to cleanup permanent files if ad creation fails
async function cleanupPermanentFile(mediaUrl: string) {
  try {
    // Extract key from URL for deletion
    const urlParts = mediaUrl.split("/");
    const permanentKey = urlParts.slice(-2).join("/"); // Get "ads/filename"

    console.log("🗑️ Cleaning up permanent file:", permanentKey);

    // You might want to add a cleanup-permanent endpoint for this
    console.log("⚠️ Manual cleanup required for:", permanentKey);
  } catch (error) {
    console.error("❌ Failed to cleanup permanent file:", error);
  }
}
