import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Invalid image. Please check your image again." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const fd = new FormData();
    fd.append("file", new Blob([buf], { type: file.type }), file.name);

    const response = await axios.post(`${API_GATEWAY_URL}/api/detect`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return NextResponse.json(response.data);
  } catch (err) {
    console.error("Detect API error", err);
    return NextResponse.json(
      {
        error: "Image failed validation. Please check your image again.",
      },
      { status: 500 }
    );
  }
}
