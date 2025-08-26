export interface AdsType {
  ledId: string;
  mediaUrl: string;
  type: string;
  duration: number;
  displayTime: {
    startTime: Date;
    endTime: Date;
  };
  pricePerSecond: number;
  totalCost: number;
}
