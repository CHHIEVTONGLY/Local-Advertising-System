import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { UserPayload } from "./app/types/UserPayload";

export async function middleware(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded: UserPayload = jwtDecode(token);

  if (decoded.role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify With Backend
  const response = await fetch(`${baseUrl}/api/auth/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (response.ok && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
