"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import CheckoutButton from "../Stripe";
import Image from "next/image";

type AdType = "image" | "video";

export default function PublishForm() {
  const [led, setLed] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); // Will be set after upload
  const [type, setType] = useState<AdType | "">("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(0);
  const [pricePerSecond, setPricePerSecond] = useState(0.5);

  const [msg, setMsg] = useState("");

  // Drag & drop state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false); // New: Upload state
  const [tempKey, setTempKey] = useState(""); // New: Store temp key
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local min for datetime-local (with seconds)
  const minLocal = useMemo(() => {
    return toLocalInputValue(new Date());
  }, []);

  const totalCost = useMemo(
    () =>
      Number((Number(duration || 0) * Number(pricePerSecond || 0)).toFixed(2)),
    [duration, pricePerSecond]
  );

  // Create ad data object - include tempKey for payment
  const adData = useMemo(
    () => ({
      ledId: led,
      tempKey, // S3 temp key instead of mediaUrl
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

  // Get user token for authentication
  const userToken = useMemo(() => Cookies.get("token"), []);

  // NEW: Upload file to backend API
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

      const { tempKey, fileUrl, message } = await response.json();

      setMsg("✅ File uploaded successfully!");
      setMediaUrl(fileUrl); // Set the S3 URL for preview/validation

      console.log("🔑 Temp key generated:", tempKey);
      console.log("📁 File URL:", fileUrl);

      return tempKey;
    } catch (error) {
      setMsg(
        `❌ Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  // Form validation function
  const validateForm = () => {
    setMsg(""); // Clear previous messages

    if (!led) {
      setMsg("Please select an LED display.");
      return false;
    }

    if (!tempKey) {
      // Check for tempKey instead of mediaUrl
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

    return true;
  };

  // Check if form is valid for checkout
  const isFormValid = useMemo(() => {
    return (
      led &&
      tempKey && // Check for tempKey instead of mediaUrl
      !uploading &&
      start &&
      end &&
      new Date(end) > new Date(start) &&
      duration > 0 &&
      totalCost > 0
    );
  }, [led, tempKey, uploading, start, end, duration, totalCost]);

  // For images: duration = end - start (seconds)
  useEffect(() => {
    if (type !== "image") return;
    if (!start || !end) return setDuration(0);
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const secs = Math.round((e - s) / 1000);
    setDuration(secs > 0 ? secs : 0);
  }, [type, start, end]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  // Helper: format Date to "YYYY-MM-DDTHH:mm:ss" (local)
  function toLocalInputValue(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
    } catch (error) {
      console.error("Upload error:", error);
      // Reset file state if upload fails
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
      void pickFile(e.dataTransfer.files?.[0]); // This will trigger upload API
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

  // If type is video and user changes start, auto-move end = start + video duration
  useEffect(() => {
    if (type !== "video") return;
    if (!start || !duration) return;
    const s = new Date(start);
    const e = new Date(s.getTime() + duration * 1000);
    setEnd(toLocalInputValue(e));
  }, [type, start, duration]);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label htmlFor="led-select" className="block text-sm font-medium">
          LED
        </label>
        <select
          id="led-select"
          value={led}
          onChange={(e) => setLed(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Select one</option>
          {/* Fake options (replace with fetched data) */}
          <option value="68ac276f23e137f1bb2fbf42">LED A</option>
          <option value="68ac276f23e137f1bb2fbf42">LED B</option>
        </select>
      </div>

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
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
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
            className="mt-1 w-full rounded-md border bg-slate-50 border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 hover:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Total cost</label>
          <input
            aria-label="Total cost"
            readOnly
            value={totalCost}
            className="mt-1 w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      {msg && (
        <p
          className={`text-sm ${
            msg.includes("✅") || msg.includes("successfully")
              ? "text-green-600"
              : msg.includes("🔄") || msg.includes("Uploading")
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <CheckoutButton
        orderId={`ad_${Date.now()}_${led}`}
        amount={totalCost}
        adTitle={`LED Advertisement - ${type} (${duration}s)`}
        adData={adData}
        userToken={userToken}
        disabled={!isFormValid}
        onValidate={validateForm}
      />
    </div>
  );
}
