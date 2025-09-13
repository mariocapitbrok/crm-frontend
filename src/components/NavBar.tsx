"use client"

import AppSidebar from "@/components/AppSidebar"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import { NotificationsIcon } from "@/components/NotificationsIcon"
import LanguageSelector from "@/components/LanguageSelector"
import UserProfileMenu from "@/components/UserProfileMenu"

export default function NavBar() {
  return (
    <section className="w-full px-4 py-2 flex items-center justify-between border-b bg-background text-foreground">
      {/* Left side: Sidebar toggle */}
      <div className="flex items-center gap-4">
        <AppSidebar />
      </div>

      {/* Right side: all other controls */}
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <NotificationsIcon />
        <LanguageSelector />
        <UserProfileMenu />
      </div>
    </section>
  )
}
