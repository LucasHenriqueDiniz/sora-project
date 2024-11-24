import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  message: string;
  progress: number;
  showLoading: (message: string) => void;
  updateProgress: (progress: number) => void;
  updateMessage: (message: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: "",
  progress: 0,
  showLoading: (message: string) => set({ isLoading: true, message, progress: 0 }),
  updateProgress: (progress: number) => set({ progress }),
  updateMessage: (message: string) => set({ message }),
  hideLoading: () => set({ isLoading: false, message: "", progress: 0 }),
}));
