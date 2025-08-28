import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Call your backend microservice
    const backendResponse = await fetch(
      `${process.env.ADS_SERVICE_URL}/api/led/all`,
      {
        method: "GET",
      }
    );

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
