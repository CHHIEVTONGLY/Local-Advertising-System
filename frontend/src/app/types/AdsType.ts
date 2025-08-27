// Update your types file to include tempKey
export interface AdsType {
  ledId: string;
  mediaUrl?: string;
  tempKey: string;
  fileName: string;
  type: "image" | "video";
  duration: number;
  displayTime: {
    startTime: string;
    endTime: string;
  };
  pricePerSecond: number;
  totalCost: number;
  status?: string;
  billingStatus?: string;
  orderId?: string;
  sessionId?: string;
  createdAt?: string;
}
