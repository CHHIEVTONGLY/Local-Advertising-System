export interface UserPayload {
  email: string;
  name: string;
  exp: number;
  iat: number;
  id: string;
  isVerified: boolean;
  profileUrl: string;
  role: string;
  telegram?: {
    chatId: string;
    isConnected: boolean;
  };
}
