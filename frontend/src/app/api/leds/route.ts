import { NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function GET() {
  try {
    // Call your backend microservice
    const backendResponse = await fetch(`${API_GATEWAY_URL}/api/leds/all`, {
      method: "GET",
    });

    if (!backendResponse.ok) {
      console.error(`❌ Backend error: ${backendResponse.status}`);
      return NextResponse.json(
        { error: "Failed to fetch LEDs from backend" },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ LED API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
