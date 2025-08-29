import { useState, useEffect, useCallback, useRef } from "react";
import {
  BookedRange,
  getFakeBookedRanges,
  hasTimeConflict,
  getConflictingRange,
  formatDateForDisplay,
} from "../utils/timeHelper";

interface UseTimeValidationProps {
  ledId: string;
  startTime: string;
  endTime: string;
}

interface UseTimeValidationReturn {
  bookedRanges: BookedRange[];
  isLoading: boolean;
  hasConflict: boolean;
  conflictMessage: string;
  refreshBookedRanges: () => void;
  lastUpdated: Date | null;
}

// 🔄 API call function
async function fetchBookedRangesFromAPI(ledId: string): Promise<BookedRange[]> {
  try {
    const response = await fetch(
      `/api/ads/book-ranges?led=${ledId}`, // ✅ Now calls Next.js API route
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }

    const data = await response.json();
    console.log("📅 API Response:", data);

    return data.bookedRanges || [];
  } catch (error) {
    console.error("❌ Error fetching booked ranges:", error);
    // Fallback to fake data during development
    return getFakeBookedRanges(ledId);
  }
}

export function useTimeValidation({
  ledId,
  startTime,
  endTime,
}: UseTimeValidationProps): UseTimeValidationReturn {
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousDataRef = useRef<string>("");

  const fetchRanges = useCallback(
    async (showLoading = false) => {
      if (!ledId) {
        setBookedRanges([]);
        setLastUpdated(null);
        previousDataRef.current = "";
        return;
      }

      if (showLoading) setIsLoading(true);

      try {
        // Add artificial delay only for UX (optional)
        if (showLoading) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // ✅ Properly await the API call
        const newRanges = await fetchBookedRangesFromAPI(ledId);
        const currentDataHash = JSON.stringify(newRanges);

        console.log("📊 Fetched ranges:", newRanges);

        // Only update if data actually changed
        if (previousDataRef.current !== currentDataHash) {
          setBookedRanges(newRanges);
          setLastUpdated(new Date());

          if (previousDataRef.current !== "" && !showLoading) {
            console.log("🔄 Booking data updated silently");
          }

          previousDataRef.current = currentDataHash;
        }
      } catch (error) {
        console.error("❌ Failed to fetch booking ranges:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [ledId]
  );

  // Initial fetch when LED changes
  useEffect(() => {
    fetchRanges(true);
  }, [ledId, fetchRanges]);

  // Smart refresh on time changes
  useEffect(() => {
    if (!ledId || !startTime || !endTime) return;

    const timeoutId = setTimeout(() => {
      console.log("🔄 Smart refresh triggered by time change");
      fetchRanges(false); // Background update, no loading
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [ledId, startTime, endTime, fetchRanges]);

  // OPTIONAL: Gentle background refresh when user is likely submitting
  useEffect(() => {
    if (!ledId || !startTime || !endTime) return;

    console.log("⏰ Starting background refresh interval");

    const interval = setInterval(() => {
      console.log("🔄 Background refresh check");
      fetchRanges(false); // Silent background update
    }, 45000); // 45 seconds

    return () => {
      console.log("🛑 Stopping background refresh");
      clearInterval(interval);
    };
  }, [ledId, startTime, endTime, fetchRanges]);

  const hasConflict = hasTimeConflict(startTime, endTime, bookedRanges);

  const conflictMessage = (() => {
    if (!hasConflict || !startTime || !endTime) return "";

    const conflictingRange = getConflictingRange(
      startTime,
      endTime,
      bookedRanges
    );

    if (conflictingRange) {
      return `⚠️ Time conflict! Your selection overlaps with booking: ${formatDateForDisplay(
        conflictingRange.start
      )} - ${formatDateForDisplay(conflictingRange.end)}`;
    }

    return "⚠️ Time conflict detected! Please choose a different time slot.";
  })();

  return {
    bookedRanges,
    isLoading,
    hasConflict,
    conflictMessage,
    refreshBookedRanges: () => fetchRanges(true),
    lastUpdated,
  };
}
