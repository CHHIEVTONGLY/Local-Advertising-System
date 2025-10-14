import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ledId: string }> }
) {
  try {
    const { ledId } = await params;
    const { adTitle, permanentMediaUrl, adData, orderId } = await req.json();
    const token = req.headers.get("authorization");

    const createAdResponse = await fetch(
      `${API_GATEWAY_URL}/api/ads/create/${ledId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
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
          createdAt: new Date().toISOString(),
        }),
      }
    );

    const adResult = await createAdResponse.json();

    if (!createAdResponse.ok) {
      // Refund if ad creation fails
      await fetch(`${API_GATEWAY_URL}/api/wallets/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({
          amount: adData.totalCost,
          type: "refund",
        }),
      });

      return NextResponse.json(
        { error: adResult.message, missingFields: adResult.missingFields },
        { status: createAdResponse.status }
      );
    }

    return NextResponse.json({ success: true, ad: adResult });
  } catch (error) {
    console.error("Ad creation error:", error);

    // Always return a response
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected internal server error",
      },
      { status: 500 }
    );
  }
}
