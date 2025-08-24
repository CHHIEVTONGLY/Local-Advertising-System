import { create } from "zustand";
type Store = {
  token: string | null;
  avatarUrl: string | null;
  login: (token: string | null) => void;
  logout: () => void;
  setAvatarUrl: (avatarUrl: string) => void;
};

export const useStore = create<Store>((set) => ({
  token: null,
  avatarUrl: null,
  login: (token) => set({ token }),
  logout: () => set({ token: null, avatarUrl: null }),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
}));
