"use client"

import * as React from "react"

export function PageSelectCheckbox(props: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
  ariaLabel?: string
  className?: string
}) {
  const { checked, indeterminate, onChange, ariaLabel, className } = props
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate, checked])
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={ariaLabel ?? "Select page"}
      aria-checked={indeterminate ? "mixed" : checked}
      checked={checked}
      onChange={onChange}
      className={className}
    />
  )
}
