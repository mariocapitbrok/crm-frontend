"use client"

import { Globe } from "lucide-react"
import { useState } from "react"

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
]

export default function LanguageSelector() {
  const [selected, setSelected] = useState("en")
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen((prev) => !prev)
  const handleSelect = (code: string) => {
    setSelected(code)
    setIsOpen(false) // Close on selection
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600"
      >
        <Globe className="w-4 h-4" />
        <span>{languages.find((lang) => lang.code === selected)?.label}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-36 origin-top-right bg-white rounded shadow-lg ring-1 ring-black ring-opacity-5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selected === lang.code ? "bg-gray-100 font-semibold" : ""
              } hover:bg-gray-100`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
