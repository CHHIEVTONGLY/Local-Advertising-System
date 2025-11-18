import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const search = req.nextUrl.search || "";
    const { data } = await axios.get(
      `${API_GATEWAY_URL}/api/transactions/me${search}`,
      {
        headers: { Authorization: `Bearer ${token || ""}` },
        withCredentials: true,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
