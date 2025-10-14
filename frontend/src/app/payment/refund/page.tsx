"use client";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default function RefundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <RotateCcw className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">
          Refund Processed
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment has been refunded. The amount should appear in your
          wallet or bank account soon.
        </p>
        <div className="flex">
          <Link
            href={"/publish"}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
