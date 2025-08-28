export interface LEDType {
  _id: string;
  name: string;
  location: string;
  screenSize: string;
  status: "active" | "inactive" | "maintenance";
  __v?: number;
}
