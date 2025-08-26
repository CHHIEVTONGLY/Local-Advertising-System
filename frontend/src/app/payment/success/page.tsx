"use client";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your advertisement is being processed and will be live soon.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => (window.location.href = "/publish")}
            className="w-full bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Create Another Ad
          </button>
        </div>
      </div>
    </div>
  );
}
