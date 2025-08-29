// Create: /frontend/src/app/api/upload-temp/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

const adsServiceUrl = process.env.ADS_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get token from cookies for authentication
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Convert file to buffer for backend
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create FormData for backend
    const backendFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    backendFormData.append("file", blob, file.name);

    console.log("🚀 Uploading file to backend:", file.name);

    // Call backend upload endpoint
    const response = await axios.post(
      `${adsServiceUrl}/api/ads/upload-temp`,
      backendFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ File uploaded successfully");

    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 }
    );
  }
}
