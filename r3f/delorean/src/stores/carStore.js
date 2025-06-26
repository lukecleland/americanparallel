import { create } from "zustand";

export const useCarStore = create((set) => ({
  index: 0,
  setIndex: (i) => set({ index: i }),
  next: (len) => set((s) => ({ index: (s.index + 1) % len })),
  prev: (len) => set((s) => ({ index: (s.index - 1 + len) % len })),
}));
