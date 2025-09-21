"use client"

import AppSidebar from "./AppSidebar"
import LanguageSelector from "./LanguageSelector"
import { NotificationsIcon } from "./NotificationsIcon"
import ThemeSwitcher from "./ThemeSwitcher"
import UserProfileMenu from "./UserProfileMenu"
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
