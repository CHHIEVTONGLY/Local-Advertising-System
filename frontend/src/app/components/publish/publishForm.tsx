"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import CheckoutButton from "../common/Checkout/Stripe";
import Image from "next/image";
import {
  formatDateForDisplay,
  calculateDuration,
} from "../../utils/timeHelper";
import { useTimeValidation } from "../../validation/timeValidation";
import WalletCheckout from "../common/Checkout/WalletCheckout";

type AdType = "image" | "video";

// ✅ LED Interface
interface LED {
  _id: string;
  name: string;
  location: string;
  screenSize: string;
  status: "active" | "inactive" | "maintenance";
  __v?: number;
}

export default function PublishForm() {
  const [mounted, setMounted] = useState(false);

  const [paymentInProgress, setPaymentInProgress] = useState<
    "checkout" | "wallet" | null
  >(null);

  const [led, setLed] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [type, setType] = useState<AdType | "">("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(0);
  const [pricePerSecond, setPricePerSecond] = useState(0.5);

  const [msg, setMsg] = useState("");

  // ✅ LED State
  const [leds, setLeds] = useState<LED[]>([]);
  const [loadingLEDs, setLoadingLEDs] = useState(true);

  // Drag & drop state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Fetch LEDs from API
  useEffect(() => {
    const fetchLEDs = async () => {
      try {
        setLoadingLEDs(true);

        const response = await fetch("/api/leds", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch LEDs: ${response.status}`);
        }

        const data = await response.json();

        // Handle the response (your API returns array directly)
        const ledsArray = Array.isArray(data) ? data : data.leds || [];
        setLeds(ledsArray);
      } catch {
        console.error("Failed to fetch LEDs");
      } finally {
        setLoadingLEDs(false);
      }
    };

    if (mounted) {
      fetchLEDs();
    }
  }, [mounted]);

  // Local min for datetime-local (with seconds)
  const minLocal = useMemo(() => {
    if (!mounted) return "";
    return toLocalInputValue(new Date());
  }, [mounted]);

  // Get user token for authentication
  const userToken = useMemo(() => {
    if (!mounted) return "";
    return Cookies.get("token") || "";
  }, [mounted]);

  // Use time validation hook
  const {
    bookedRanges,
    isLoading: loadingBookedRanges,
    hasConflict,
    conflictMessage,
    refreshBookedRanges,
    lastUpdated,
  } = useTimeValidation({
    ledId: led,
    startTime: start,
    endTime: end,
  });

  const totalCost = useMemo(
    () =>
      Number((Number(duration || 0) * Number(pricePerSecond || 0)).toFixed(2)),
    [duration, pricePerSecond]
  );

  // Create ad data object - include tempKey for payment
  const adData = useMemo(
    () => ({
      ledId: led,
      mediaUrl,
      tempKey,
      fileName: mediaFile?.name || "",
      type,
      duration,
      displayTime: {
        startTime: start ? new Date(start).toISOString() : "",
        endTime: end ? new Date(end).toISOString() : "",
      },
      pricePerSecond,
      totalCost,
    }),
    [
      led,
      mediaUrl,
      tempKey,
      mediaFile?.name,
      type,
      duration,
      start,
      end,
      pricePerSecond,
      totalCost,
    ]
  );

  // Check if form is valid for checkout
  const isFormValid = useMemo(() => {
    return (
      led &&
      tempKey &&
      !uploading &&
      start &&
      end &&
      new Date(end) > new Date(start) &&
      duration > 0 &&
      totalCost > 0 &&
      !hasConflict // Add time conflict check
    );
  }, [led, tempKey, uploading, start, end, duration, totalCost, hasConflict]);

  // For images: duration = end - start (seconds)
  useEffect(() => {
    if (type !== "image") return;

    const calculatedDuration = calculateDuration(start, end);
    setDuration(calculatedDuration);
  }, [type, start, end]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // If type is video and user changes start, auto-move end = start + video duration
  useEffect(() => {
    if (type !== "video") return;
    if (!start || !duration) return;
    const s = new Date(start);
    const e = new Date(s.getTime() + duration * 1000);
    setEnd(toLocalInputValue(e));
  }, [type, start, duration]);

  // Protected from hydration
  if (!mounted) {
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="h-12 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Helper: format Date to "YYYY-MM-DDTHH:mm:ss" (local)
  function toLocalInputValue(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // Upload file to backend API
  async function uploadToTempStorage(file: File): Promise<string> {
    setUploading(true);
    setMsg("🔄 Uploading file to temporary storage...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-temp", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const { tempKey, fileUrl } = await response.json();

      setMsg("✅ File uploaded successfully!");
      setMediaUrl(fileUrl);

      return tempKey;
    } catch (error) {
      setMsg(
        `❌ Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    } finally {
      setUploading(false);
    }
  }

  // Form validation function
  const validateForm = () => {
    setMsg("");

    if (!led) {
      setMsg("Please select an LED display.");
      return false;
    }

    if (!tempKey) {
      setMsg("Please upload a media file.");
      return false;
    }

    if (uploading) {
      setMsg("Please wait for file upload to complete.");
      return false;
    }

    if (!start) {
      setMsg("Please select a start time.");
      return false;
    }

    if (!end) {
      setMsg("Please select an end time.");
      return false;
    }

    if (new Date(end) <= new Date(start)) {
      setMsg("End time must be after start time.");
      return false;
    }

    if (duration <= 0) {
      setMsg("Duration must be greater than 0 seconds.");
      return false;
    }

    if (totalCost <= 0) {
      setMsg("Total cost must be greater than $0.");
      return false;
    }

    // Check for time conflicts
    if (hasConflict) {
      setMsg(conflictMessage);
      return false;
    }

    return true;
  };

  function openFileDialog() {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  }

  function clearMedia() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMediaFile(null);
    setMediaUrl("");
    setType("");
    setDuration(0);
    setTempKey("");
    setMsg("");
  }

  // Helper: read duration from a video File via metadata
  function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const el = document.createElement("video");
      const cleanup = () => {
        el.src = "";
        URL.revokeObjectURL(url);
      };
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        const secs = Math.round(el.duration || 0);
        cleanup();
        resolve(secs);
      };
      el.onerror = () => {
        cleanup();
        reject(new Error("Failed to read video metadata"));
      };
      el.src = url;
    });
  }

  // UPDATED: Modified to call upload API
  async function pickFile(f: File | undefined | null) {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      setMsg("❌ Only image or video files are allowed.");
      return;
    }

    // Check file size (max 100MB)
    if (f.size > 100 * 1024 * 1024) {
      setMsg("❌ File size must be less than 100MB.");
      return;
    }

    setMsg("");
    setMediaFile(f);
    const isVideo = f.type.startsWith("video/");
    setType(isVideo ? "video" : "image");

    // Create preview URL
    const url = URL.createObjectURL(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);

    try {
      // Upload to backend API immediately
      const uploadedTempKey = await uploadToTempStorage(f);
      setTempKey(uploadedTempKey);

      // Handle video duration
      if (isVideo) {
        try {
          const secs = await getVideoDuration(f);
          setDuration(secs > 0 ? secs : 0);

          if (start && secs > 0) {
            const s = new Date(start);
            const e = new Date(s.getTime() + secs * 1000);
            setEnd(toLocalInputValue(e));
          }
        } catch {
          setMsg("⚠️ Could not read video duration.");
          setDuration(0);
        }
      }
    } catch {
      setMediaFile(null);
      setType("");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  function onBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    void pickFile(f || null);
    e.currentTarget.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!uploading) {
      void pickFile(e.dataTransfer.files?.[0]);
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!uploading) {
      setDragOver(true);
    }
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* ✅ UPDATED LED SELECT SECTION */}
      <div>
        <label htmlFor="led-select" className="block text-sm font-medium">
          LED
        </label>
        <select
          id="led-select"
          value={led}
          onChange={(e) => setLed(e.target.value)}
          disabled={loadingLEDs}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 disabled:opacity-50"
          title="Select an LED display"
        >
          <option value="">
            {loadingLEDs ? "Loading LEDs..." : "Select one"}
          </option>

          {/* ✅ Map through fetched LEDs */}
          {leds
            .filter((ledOption) => ledOption.status === "active") // Only show active LEDs
            .map((ledOption) => (
              <option key={ledOption._id} value={ledOption._id}>
                {ledOption.name} - {ledOption.location} ({ledOption.screenSize})
              </option>
            ))}
        </select>

        {/* ✅ Show selected LED details */}
        {led && leds.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            {(() => {
              const selectedLED = leds.find((l) => l._id === led);
              return selectedLED ? (
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex justify-between items-center">
                    <span>📺 {selectedLED.name}</span>
                    <span>📐 {selectedLED.screenSize}</span>
                  </div>
                  <div className="mt-1 text-blue-600 dark:text-blue-400">
                    📍 {selectedLED.location} • Status: {selectedLED.status}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-600">
                  LED not found in data
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Display booked ranges for selected LED */}
      {led && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center justify-between p-3 border-b border-yellow-200 dark:border-yellow-700">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              📅 Currently Booked Time Slots
            </h4>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-yellow-600">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={refreshBookedRanges}
                disabled={loadingBookedRanges}
                className="text-xs text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* FIXED HEIGHT SCROLLABLE AREA */}
          <div className="h-48 overflow-y-auto p-3">
            {loadingBookedRanges ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                <span className="ml-2 text-sm text-yellow-600">Loading...</span>
              </div>
            ) : bookedRanges.length === 0 ? (
              <div className="flex items-center justify-center h-full text-yellow-600">
                <span className="text-sm">
                  ✅ No bookings found - all times available!
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {bookedRanges.map((range, index) => {
                  const startTime = new Date(range.start);
                  const endTime = new Date(range.end);
                  const rangeDuration = Math.round(
                    (endTime.getTime() - startTime.getTime()) / 1000
                  );

                  return (
                    <div
                      key={range.id || index}
                      className="flex justify-between items-center py-2 px-3 bg-white rounded border dark:bg-slate-800 dark:border-slate-700"
                    >
                      <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                        {formatDateForDisplay(range.start)}
                        <span className="text-slate-500 mx-2">→</span>
                        {formatDateForDisplay(range.end)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {rangeDuration}s
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-3 pb-3">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ Please choose a time that doesn&apos;t overlap with these
              bookings
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Media (image/video)</label>
        <div
          onClick={openFileDialog}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          className={[
            "mt-1 flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition",
            uploading
              ? "border-yellow-500 bg-yellow-50/50 cursor-not-allowed"
              : dragOver
              ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/20 cursor-pointer"
              : "border-slate-300 hover:border-sky-400 dark:border-slate-700 cursor-pointer",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <p className="text-sm text-yellow-700">Uploading file...</p>
              <p className="text-xs text-yellow-600">Please wait...</p>
            </>
          ) : !previewUrl ? (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Drag & drop your file here, or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Accepted: image/*, video/* (Max 100MB)
              </p>
            </>
          ) : (
            <div className="w-full">
              {type === "image" ? (
                <Image
                  width={160}
                  height={90}
                  src={previewUrl}
                  alt="preview"
                  className="mx-auto h-40 w-auto rounded-md object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="mx-auto h-40 w-auto rounded-md bg-black"
                />
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">{mediaFile?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearMedia();
                  }}
                  className="rounded-md border px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
              {tempKey && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Uploaded to temporary storage
                </p>
              )}
            </div>
          )}
        </div>
        <input
          aria-label="File upload"
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onBrowse}
          disabled={uploading}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Type</label>
          <div>
            <input
              aria-label="Media type"
              type="text"
              readOnly
              value={type}
              disabled
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 hover:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Duration (seconds)
          </label>
          <input
            type="number"
            readOnly
            value={duration || ""}
            placeholder="Duration in seconds"
            title="Duration in seconds"
            className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-500">
            {type === "video"
              ? "Auto from video file."
              : "Auto from Start and End."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Start time</label>
          <input
            aria-label="Start time"
            type="datetime-local"
            step={1}
            min={minLocal}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={`mt-1 w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 ${
              hasConflict
                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                : "border-slate-300"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End time</label>
          <input
            type="datetime-local"
            step={1}
            min={start || minLocal}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            readOnly={type === "video"}
            title={type === "video" ? "Auto-set from video length" : undefined}
            className={`mt-1 w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 ${
              type === "video"
                ? "bg-slate-50 cursor-not-allowed"
                : hasConflict
                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                : "border-slate-300"
            }`}
          />
          {type === "video" && duration > 0 && start && (
            <p className="mt-1 text-xs text-slate-500">
              End time auto-set to Start + {duration}s.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Price / second</label>
          <input
            aria-label="Price per second"
            type="number"
            disabled
            value={pricePerSecond}
            onChange={(e) => setPricePerSecond(Number(e.target.value))}
            placeholder="Price per second"
            className="mt-1 w-full rounded-md border bg-slate-50 border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 hover:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Total Cost</label>
          <input
            aria-label="Total cost"
            readOnly
            value={totalCost}
            placeholder="Total cost"
            className="mt-1 w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Show conflict message or regular message */}
      {(msg || conflictMessage) && (
        <p
          className={`text-sm ${
            conflictMessage
              ? "text-orange-600"
              : msg.includes("✅") || msg.includes("successfully")
              ? "text-green-600"
              : msg.includes("🔄") || msg.includes("Uploading")
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {conflictMessage || msg}
        </p>
      )}

      <CheckoutButton
        orderId={`ad_${Date.now()}_${led}`}
        amount={totalCost}
        adTitle={`LED Advertisement - ${type} (${duration}s)`}
        adData={adData}
        userToken={userToken}
        disabled={!isFormValid || paymentInProgress === "wallet"}
        onValidate={() => {
          const valid = validateForm();
          if (valid) setPaymentInProgress("checkout");
          return valid;
        }}
        onComplete={() => setPaymentInProgress(null)}
      />
      <WalletCheckout
        orderId={`ad_${Date.now()}_${led}`}
        amount={totalCost}
        adTitle={`LED Advertisement - ${type} (${duration}s)`}
        adData={adData}
        userToken={userToken}
        disabled={!isFormValid || paymentInProgress === "checkout"}
        onValidate={() => {
          const valid = validateForm();
          if (valid) setPaymentInProgress("wallet");
          return valid;
        }}
        onError={(msg) => {
          setMsg(`❌ Payment failed : ${msg}`);
          setPaymentInProgress(null);
        }}
        onComplete={() => setPaymentInProgress(null)}
      />
    </div>
  );
}
