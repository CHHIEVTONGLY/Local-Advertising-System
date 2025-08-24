import { NextResponse } from "next/server";
import axios from "axios";

const userUrl = process.env.USERS_SERVICE_URL;

export async function POST(req) {
  try {
    const body = await req.json();

    const { data } = await axios.post(
      `${userUrl}/api/users/forgot-password`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data || "Internal server error" },
      { status: err.response?.status || 500 }
    );
  }
}
