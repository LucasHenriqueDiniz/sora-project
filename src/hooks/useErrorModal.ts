import { create } from "zustand";

interface ErrorModalState {
  isOpen: boolean;
  title: string;
  error: string;
  showError: (title: string, error: string) => void;
  hideError: () => void;
}

export const useErrorModal = create<ErrorModalState>((set) => ({
  isOpen: false,
  title: "",
  error: "",
  showError: (title: string, error: string) => set({ isOpen: true, title, error }),
  hideError: () => set({ isOpen: false, title: "", error: "" }),
}));
