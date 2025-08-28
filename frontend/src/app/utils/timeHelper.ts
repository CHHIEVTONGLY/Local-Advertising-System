export interface BookedRange {
  start: string;
  end: string;
  id?: string;
  advertiserId?: string;
}

/**
 * Format Date to "YYYY-MM-DDTHH:mm:ss" for datetime-local input
 */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Check if a time range conflicts with any booked ranges
 */
export function hasTimeConflict(
  startTime: string,
  endTime: string,
  bookedRanges: BookedRange[]
): boolean {
  if (!startTime || !endTime || bookedRanges.length === 0) return false;

  const requestStart = new Date(startTime);
  const requestEnd = new Date(endTime);

  return bookedRanges.some(({ start: bookedStart, end: bookedEnd }) => {
    const bookedStartDate = new Date(bookedStart);
    const bookedEndDate = new Date(bookedEnd);

    // Check for any overlap
    return (
      (requestStart >= bookedStartDate && requestStart < bookedEndDate) ||
      (requestEnd > bookedStartDate && requestEnd <= bookedEndDate) ||
      (requestStart <= bookedStartDate && requestEnd >= bookedEndDate)
    );
  });
}

/**
 * Get the specific conflicting booked range
 */
export function getConflictingRange(
  startTime: string,
  endTime: string,
  bookedRanges: BookedRange[]
): BookedRange | null {
  if (!startTime || !endTime || bookedRanges.length === 0) return null;

  const requestStart = new Date(startTime);
  const requestEnd = new Date(endTime);

  return (
    bookedRanges.find(({ start: bookedStart, end: bookedEnd }) => {
      const bookedStartDate = new Date(bookedStart);
      const bookedEndDate = new Date(bookedEnd);

      return (
        (requestStart >= bookedStartDate && requestStart < bookedEndDate) ||
        (requestEnd > bookedStartDate && requestEnd <= bookedEndDate) ||
        (requestStart <= bookedStartDate && requestEnd >= bookedEndDate)
      );
    }) || null
  );
}

/**
 * Calculate duration in seconds between two datetime strings
 */
export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;

  return Math.max(0, Math.round(durationMs / 1000));
}

/**
 * Fake data for testing - replace with actual API call
 */
export function getFakeBookedRanges(ledId: string): BookedRange[] {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const fakeData: { [key: string]: BookedRange[] } = {
    "68ac276f23e137f1bb2fbf42": [
      // LED A
      {
        id: "booking1",
        start: `${today}T09:30:15.000Z`,
        end: `${today}T09:30:45.000Z`,
        advertiserId: "user123",
      },
      {
        id: "booking2",
        start: `${today}T14:00:00.000Z`,
        end: `${today}T14:00:30.000Z`,
        advertiserId: "user456",
      },
      {
        id: "booking3",
        start: `${today}T18:15:10.000Z`,
        end: `${today}T18:16:25.000Z`,
        advertiserId: "user789",
      },
      {
        id: "booking7",
        start: `${today}T18:16:50.000Z`,
        end: `${today}T18:18:00.000Z`,
        advertiserId: "user789",
      },
         {
        id: "booking8",
        start: `${today}T18:16:50.000Z`,
        end: `${today}T18:18:00.000Z`,
        advertiserId: "user789",
      },
         {
        id: "booking10",
        start: `${today}T18:16:50.000Z`,
        end: `${today}T18:18:00.000Z`,
        advertiserId: "user789",
      },
    ],
    "68ac276f23e137f1bb2fbf43": [
      // LED B
      {
        id: "booking4",
        start: `${today}T11:00:00.000Z`,
        end: `${today}T11:01:00.000Z`,
        advertiserId: "userABC",
      },
      {
        id: "booking5",
        start: `${today}T16:30:00.000Z`,
        end: `${today}T16:31:30.000Z`,
        advertiserId: "userDEF",
      },
      {
        id: "booking9",
        start: `${today}T16:30:00.000Z`,
        end: `${today}T16:31:30.000Z`,
        advertiserId: "userDEF",
      },
    ],
  };

  return fakeData[ledId] || [];
}
