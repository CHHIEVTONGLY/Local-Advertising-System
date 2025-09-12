import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ledId = searchParams.get("led");

    if (!ledId) {
      return NextResponse.json(
        { error: "LED ID is required" },
        { status: 400 }
      );
    }

    // Call your backend microservice
    const backendResponse = await fetch(
      `${API_GATEWAY_URL}/api/ads/book-ranges?led=${ledId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!backendResponse.ok) {
      console.error(`❌ Backend error: ${backendResponse.status}`);
      return NextResponse.json(
        { error: "Failed to fetch bookings from backend" },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Return the data to frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
