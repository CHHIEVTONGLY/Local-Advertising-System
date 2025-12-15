import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pricingId: string }> }
) {
  try {
    const { pricingId } = await params;

    const pricingResponse = await fetch(
      `http://localhost:3002/api/ads/pricing/${pricingId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const pricingData = await pricingResponse.json();

    if (!pricingResponse.ok) {
      return NextResponse.json(
        { error: pricingData.error || "Failed to fetch pricing data" },
        { status: pricingResponse.status }
      );
    }

    return NextResponse.json(pricingData, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
