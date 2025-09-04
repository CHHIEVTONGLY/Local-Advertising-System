import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const body = await req.json();
    const { data } = await axios.post(
      `${process.env.BILLING_SERVICE_URL}/api/wallets/deduct`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error wallet deduct failed:", error);
    return NextResponse.json(
      { error: "Failed to deduct from wallet" },
      { status: 500 }
    );
  }
}
