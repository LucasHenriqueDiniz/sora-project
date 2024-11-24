import { create } from "zustand";

export interface ProjectDiagnostic {
  id: string;
  type: "error" | "warning";
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

interface ProjectDiagnosticsState {
  errors: ProjectDiagnostic[];
  warnings: ProjectDiagnostic[];
  addError: (error: Omit<ProjectDiagnostic, "id" | "type">) => void;
  addWarning: (warning: Omit<ProjectDiagnostic, "id" | "type">) => void;
  clearErrors: () => void;
  clearWarnings: () => void;
  clearAll: () => void;
}

export const useProjectDiagnosticsStore = create<ProjectDiagnosticsState>((set) => ({
  errors: [],
  warnings: [],

  addError: (error) =>
    set((state) => ({
      errors: [...state.errors, { ...error, id: Math.random().toString(36).substr(2, 9), type: "error" }],
    })),

  addWarning: (warning) =>
    set((state) => ({
      warnings: [...state.warnings, { ...warning, id: Math.random().toString(36).substr(2, 9), type: "warning" }],
    })),

  clearErrors: () => set({ errors: [] }),
  clearWarnings: () => set({ warnings: [] }),
  clearAll: () => set({ errors: [], warnings: [] }),
}));
