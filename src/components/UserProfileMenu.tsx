"use client"

import { User, Settings, LogOut } from "lucide-react"
import { useState } from "react"

export default function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen((prev) => !prev)

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-40 origin-top-right bg-white rounded shadow-lg ring-1 ring-black ring-opacity-5">
          <button className="flex items-center w-full gap-2 px-4 py-2 text-sm hover:bg-gray-100">
            <User className="w-4 h-4" />
            Profile
          </button>
          <button className="flex items-center w-full gap-2 px-4 py-2 text-sm hover:bg-gray-100">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center w-full gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
