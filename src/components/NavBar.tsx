"use client"

import AppSidebar from "@/components/AppSidebar"
import LanguageSelector from "@/components/LanguageSelector"
import { NotificationsIcon } from "@/components/NotificationsIcon"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import UserProfileMenu from "@/components/UserProfileMenu"
import AiIcon from "./AiIcon"
import JoinACall from "./JoinACall"
import Share from "./Share"
import ShowComments from "./ShowComments"
import ShowHistory from "./ShowHistory"

export default function NavBar() {
  return (
    <section className="w-full px-4 py-2 flex items-center justify-between border-b bg-background text-foreground">
      {/* Left side: Sidebar toggle */}
      <div className="flex items-center gap-4">
        <AppSidebar />
      </div>

      {/* Right side: all other controls */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <ShowHistory />
        <ShowComments />
        <AiIcon />
        <NotificationsIcon />
        <JoinACall />
        <LanguageSelector />
        <Share />
        <UserProfileMenu />
      </div>
    </section>
  )
}
