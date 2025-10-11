import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Call your backend login API
    const response = await fetch(
      `${process.env.API_GATEWAY_URL}/api/users/admin/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return new NextResponse("Login failed", { status: response.status });
    }

    const data = await response.json();

    // Create a response and set the JWT cookie
    const res = NextResponse.json(data, { status: 200 });

    res.cookies.set({
      name: "token",
      value: data.token,
      httpOnly: true, // Cannot be accessed by JS
      path: "/", // Cookie is available on all routes
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "strict",
    });

    return res;
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
