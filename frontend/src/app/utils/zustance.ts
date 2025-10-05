import { create } from "zustand";
type Store = {
  token: string | null;
  avatarUrl: string | null;
  telegramConnected: boolean | null;
  login: (token: string | null) => void;
  logout: () => void;
  setAvatarUrl: (avatarUrl: string) => void;
  setTelegramConnected: (connected: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  token: null,
  avatarUrl: null,
  telegramConnected: false,
  login: (token) => set({ token }),
  logout: () => set({ token: null, avatarUrl: null, telegramConnected: false }),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  setTelegramConnected: (connected) => set({ telegramConnected: connected }),
}));
