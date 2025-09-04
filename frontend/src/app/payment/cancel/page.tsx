"use client";
import Link from "next/link";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. If this was a mistake, you can try
          again or contact support for help.
        </p>

        <div className="space-y-3 flex flex-col">
          <Link
            href="/publish"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="w-full bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
