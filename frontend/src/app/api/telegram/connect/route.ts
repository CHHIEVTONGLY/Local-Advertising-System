import { NextResponse } from "next/server";
import axios from "axios";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization");

    if (!API_GATEWAY_URL) {
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    const { data } = await axios.post(
      `${API_GATEWAY_URL}/api/users/telegram/connect`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Telegram connect error:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || "Backend error" },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
