"use client"

import * as React from "react"

export function FilterControl(props: {
  type: "text" | "select"
  value: string
  onChange: (v: string) => void
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}) {
  const { type, value, onChange, placeholder, options } = props
  if (type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder ?? "All"}</option>
        {(options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Filter"}
    />
  )
}

