import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await axios.get(`${API_GATEWAY_URL}/api/wallets/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
