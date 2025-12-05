export interface Pricing {
  basePrice: number;
  primeMultiplier: number;
  weekendMultiplier: number;
  offPeakMultiplier: number;
  primeHours: number[]; // 17, 18, 19
}
