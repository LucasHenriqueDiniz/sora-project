import { create } from "zustand";

export type ActionType = "info" | "warning" | "error" | "success";

export interface Action {
  id: string;
  type: ActionType;
  message: string;
  timestamp: number;
}

interface ActionsState {
  actions: Action[];
  addAction: (type: ActionType, message: string) => void;
  clearActions: () => void;
}

export const useActionsStore = create<ActionsState>((set) => ({
  actions: [],
  addAction: (type, message) =>
    set((state) => ({
      actions: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type,
          message,
          timestamp: Date.now(),
        },
        ...state.actions.slice(0, 99), // Manter apenas os últimos 100 eventos
      ],
    })),
  clearActions: () => set({ actions: [] }),
}));
