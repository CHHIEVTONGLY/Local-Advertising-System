"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AdsType } from "@/app/types/AdsType";

export default function DebugWebSocket() {
  const [ads, setAds] = useState<AdsType[]>([]);

  // Fetch ads via WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3010";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("WebSocket connected", wsUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "init" || data.action === "update") {
        setAds(data.ads);
      }
    };
    ws.onerror = () => {};
    ws.onclose = () => console.log("WebSocket disconnected");

    return () => ws.close();
  }, []);

  // Find all currently active ads, grouped by led
  const now = new Date();
  // Map: ledId -> ad
  const activeAdsByLed = ads.reduce<Record<string, AdsType>>((acc, ad) => {
    const start = new Date(ad.displayTime.startTime);
    const end = new Date(ad.displayTime.endTime);
    if (now >= start && now <= end) {
      acc[ad.led._id] = ad;
    }
    return acc;
  }, {});

  // Convert to array for rendering
  const activeAds = Object.entries(activeAdsByLed);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-w-7xl mx-auto w-screen min-h-screen text-black py-4 ">
      {activeAds.length > 0 ? (
        activeAds.map(([led, ad]) => (
          <div
            key={led}
            className="relative flex flex-col items-center justify-center bg-gray-900 rounded-lg overflow-hidden min-h-[300px]"
          >
            <h3 className="absolute top-4 left-4 text-xl z-10 drop-shadow">
              Screen: {led}
            </h3>
            {ad.type === "video" ? (
              <video
                src={ad.mediaUrl ?? ""}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            ) : (
              <Image
                src={ad.mediaUrl ?? ""}
                alt={ad.title}
                fill
                className="object-cover"
                style={{ zIndex: 0 }}
                priority
              />
            )}
          </div>
        ))
      ) : (
        <p>No active ads found</p>
      )}
    </div>
  );
}
