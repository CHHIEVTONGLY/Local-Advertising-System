import { NextResponse } from "next/server";
import axios from "axios";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!API_GATEWAY_URL) {
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const { data } = await axios.get(
      `${API_GATEWAY_URL}/api/users/telegram/status`,
      { headers }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get telegram status error:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error:
            error.response?.data?.message ||
            error.response?.data ||
            "Backend error",
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
