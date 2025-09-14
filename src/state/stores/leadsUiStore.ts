import { create } from "zustand"

export type HeaderLayout = "split" | "popover"

type LeadsUiState = {
  headerLayout: HeaderLayout
  setHeaderLayout: (v: HeaderLayout) => void
}

export const useLeadsUiStore = create<LeadsUiState>((set) => ({
  headerLayout: "popover",
  setHeaderLayout: (v) => set({ headerLayout: v }),
}))
