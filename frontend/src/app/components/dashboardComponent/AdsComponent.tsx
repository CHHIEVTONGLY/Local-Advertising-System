"use client";
import { AdsType } from "@/app/types/AdsType";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdCard({ ad }: { ad: AdsType }) {
  const {
    title,
    mediaUrl,
    type,
    duration,
    totalCost,
    status,
    billingStatus,
    reviewStatus,
    displayTime,
    led,
    pricePerSecond,
  } = ad;

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const badge = (label: string, value: string) => {
    const colors: Record<string, string> = {
      // status enum: ["draft", "pending", "active", "completed"]
      draft: "bg-slate-100 text-slate-700 border border-slate-300",
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      active: "bg-green-100 text-green-700 border border-green-300",
      completed: "bg-emerald-100 text-emerald-700 border border-emerald-300",

      // billingStatus enum: ["unpaid", "paid", "refunded"]
      unpaid: "bg-gray-100 text-gray-700 border border-gray-300",
      paid: "bg-blue-100 text-blue-700 border border-blue-300",
      refunded: "bg-purple-100 text-purple-700 border border-purple-300",

      // reviewStatus enum: ["pending", "approved", "rejected"]
      approved: "bg-green-100 text-green-700 border border-green-300",
      rejected: "bg-red-100 text-red-700 border border-red-300",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-lg capitalize ${
          colors[value] || "bg-gray-100 text-gray-600"
        }`}
      >
        {label ? `${label}: ${value}` : value}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition duration-200 hover:-translate-y-1">
        {/* Media Preview */}
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          {type === "image" ? (
            <Image
              width={150}
              height={150}
              src={mediaUrl || ""}
              alt="Ad preview"
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <video
              src={mediaUrl}
              className="object-cover w-full h-full"
              muted
            />
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 truncate">
            Ad Title: <span className="font-normal text-gray-600">{title}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {badge("Status", status ?? "")}
            {badge("Review", reviewStatus ?? "")}
            {badge("Billing", billingStatus ?? "")}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Type:</span> {type}
            </p>
            <p>
              <span className="font-semibold">Duration:</span> {duration}s
            </p>
            <p>
              <span className="font-semibold">Total Cost:</span> $
              {totalCost?.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Price Per Second:</span> $
              {pricePerSecond.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">LED:</span> {led.location}
            </p>
            <p className="col-span-2 text-xs text-gray-500">
              {new Date(displayTime.startTime).toLocaleString()} →{" "}
              {new Date(displayTime.endTime).toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center cursor-pointer"
            >
              Preview
              <ExternalLink className="ml-1 h-4 w-4" />
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow">
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {title || "Ad Preview"}
              </h2>
              <button
                aria-label="Close"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Content */}
            <div className="p-6">
              <div className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                {type === "video" ? (
                  <video
                    src={mediaUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-[70vh] rounded-lg"
                  />
                ) : (
                  <Image
                    src={mediaUrl || ""}
                    alt="Ad preview"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-auto h-auto max-w-full max-h-[70vh] rounded-lg object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
