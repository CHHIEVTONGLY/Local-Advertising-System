import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const adsServiceUrl = process.env.ADS_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const { adData, orderId, sessionId } = await req.json();

    // Step 1: Move file from temp to permanent location
    const moveFileResponse = await axios.post(
      `${adsServiceUrl}/api/ads/move-to-permanent`,
      {
        tempKey: adData.tempKey,
        fileName: adData.fileName,
        orderId,
        sessionId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!moveFileResponse.data.mediaUrl) {
      return NextResponse.json(
        { error: "Failed to get permanent media URL" },
        { status: 500 }
      );
    }

    const permanentMediaUrl = moveFileResponse.data.mediaUrl;

    return NextResponse.json({ mediaUrl: permanentMediaUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
