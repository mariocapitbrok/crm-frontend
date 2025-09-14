import { createEntityUiStore, type HeaderLayout } from "./createEntityUiStore"

export type { HeaderLayout }

// Default/base UI store for entities that don't need a custom one yet.
// Uses a shared localStorage key so preferences apply across such entities.
export const useDefaultEntityUiStore = createEntityUiStore("entity-ui-default")

