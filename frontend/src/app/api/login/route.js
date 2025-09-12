import { NextResponse } from "next/server";
import axios from "axios";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function POST(req) {
  try {
    const body = await req.json();

    const { data } = await axios.post(
      `${API_GATEWAY_URL}/api/users/login`,
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
