"use client"

import { Globe } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
]

export default function LanguageSelector() {
  const [selected, setSelected] = useState("en")

  const current = languages.find((l) => l.code === selected)?.label ?? "English"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="inline-flex items-center gap-2" aria-label="Language selector">
          <Globe className="w-4 h-4" />
          <span className="text-sm">{current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => setSelected(lang.code)}>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
