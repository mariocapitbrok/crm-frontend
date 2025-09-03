"use client"

import SidebarToggle from "@/components/SidebarToggle"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import { NotificationsIcon } from "@/components/NotificationsIcon"
import LanguageSelector from "@/components/LanguageSelector"
import UserProfileMenu from "@/components/UserProfileMenu"

export default function NavBar() {
  return (
    <header className="w-full px-4 py-2 bg-gray-200 shadow flex items-center justify-between">
      {/* Left side: Sidebar toggle */}
      <div className="flex items-center gap-4">
        <SidebarToggle />
      </div>

      {/* Right side: all other controls */}
      <div className="flex items-center gap-4">
        <ThemeSwitcher isDark={false} />
        <NotificationsIcon />
        <LanguageSelector />
        <UserProfileMenu />
      </div>
    </header>
  )
}
