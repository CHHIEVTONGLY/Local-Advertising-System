// Update your types file to include tempKey
export interface AdsType {
  _id: string;
  title: string;
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
  reviewStatus: string;
  led: string;
  pricePerSecond: number;
  totalCost: number;
  status?: string;
  billingStatus?: string;
  orderId?: string;
  sessionId?: string;
  createdAt?: string;
}

export interface AdData {
  ledId: string;
  mediaUrl: string;
  type: string;
  duration: number;
  displayTime: {
    startTime: string;
    endTime: string;
  };
  pricePerSecond: number;
  totalCost: number;
  tempKey?: string;
  fileName?: string;
}
