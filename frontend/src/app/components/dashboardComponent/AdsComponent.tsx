"use client";
import { AdsType } from "@/app/types/AdsType";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

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

  const badge = (label: string, value: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-100 text-green-700 border border-green-300",
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      rejected: "bg-red-100 text-red-700 border border-red-300",
      paid: "bg-blue-100 text-blue-700 border border-blue-300",
      unpaid: "bg-gray-100 text-gray-700 border border-gray-300",
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
              <span className="font-semibold">LED:</span> {led}
            </p>
            <p className="col-span-2 text-xs text-gray-500">
              {new Date(displayTime.startTime).toLocaleString()} →{" "}
              {new Date(displayTime.endTime).toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full relative">
            <button
              aria-label="Close"
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            >
              <X />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">
                {title || "Ad Preview"}
              </h2>
              {type === "video" ? (
                <video
                  src={mediaUrl}
                  controls
                  autoPlay
                  className="w-full rounded-lg ad-video-preview"
                />
              ) : (
                <Image
                  src={mediaUrl || ""}
                  alt="Ad preview"
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
