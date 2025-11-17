import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

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

    const detectionFormData = new FormData();
    detectionFormData.append("file", file);

    const detectRes = await axios.post(
      `${API_GATEWAY_URL}/api/detect`,
      detectionFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const detectResult = detectRes.data;

    if (detectResult.label !== "BANANA") {
      return NextResponse.json(
        {
          error:
            "Please check your image again. Image restriction: illegal content detected.",
        },
        { status: 400 }
      );
    }

    // ✅ CREATE ULTRA-SHORT FILENAME
    const originalFileName = file.name;
    const extension = originalFileName.split(".").pop() || "";

    // Generate 6-character hash for ultra-short filename
    const hash = crypto
      .createHash("md5")
      .update(originalFileName + Date.now())
      .digest("hex")
      .substring(0, 6); // Only 6 characters!

    const shortFileName = `${hash}.${extension}`;

    // Convert file to buffer for backend
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ CREATE FORMDATA WITH SHORT FILENAME
    const backendFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    backendFormData.append("file", blob, shortFileName); // ✅ Use ultra-short filename
    backendFormData.append("originalFileName", originalFileName); // ✅ Send original for reference
    backendFormData.append("useUltraShortPath", "true"); // ✅ Signal backend for shortest path

    // Call backend upload endpoint
    const response = await axios.post(
      `${API_GATEWAY_URL}/api/ads/upload-temp`,
      backendFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ RETURN ENHANCED RESPONSE WITH SHORT FILENAMES
    return NextResponse.json({
      ...response.data,
      shortFileName: shortFileName,
      originalFileName: originalFileName,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);

    // Better error logging
    if (axios.isAxiosError(error)) {
      console.error("Backend error:", error.response?.data);
      console.error("Backend status:", error.response?.status);
    }

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
