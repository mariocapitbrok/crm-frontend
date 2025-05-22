import SidebarToggle from "@/components/SidebarToggle";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function() {
  return (
    <>
      <SidebarToggle />
      <ThemeSwitcher isDark={true} />
    </>
  )
}