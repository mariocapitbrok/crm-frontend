import { createEntityUiStore, type HeaderLayout } from "@/state/stores/createEntityUiStore"

export type { HeaderLayout }

export const useLeadsUiStore = createEntityUiStore("leads-ui")
