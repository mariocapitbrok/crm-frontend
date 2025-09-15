"use client"

import * as React from "react"
import type { SavedViewsService } from "./savedViews"
import { createInMemorySavedViews } from "./inmemory/savedViews"

export type Api = {
  savedViews: SavedViewsService
}

const ApiContext = React.createContext<Api | null>(null)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "InMemory"

  const api = React.useMemo<Api>(() => {
    if (apiMode === "InMemory") {
      return {
        savedViews: createInMemorySavedViews(),
      }
    }
    // Future: Http adapter goes here
    return {
      savedViews: createInMemorySavedViews(),
    }
  }, [apiMode])

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

export function useApi(): Api {
  const ctx = React.useContext(ApiContext)
  if (!ctx) throw new Error("useApi must be used within ApiProvider")
  return ctx
}

