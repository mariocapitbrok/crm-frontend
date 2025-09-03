import { Bell } from "lucide-react"

export function NotificationsIcon() {
  return (
    <button className="p-2 hover:bg-gray-700 rounded relative  hover:text-white">
      <Bell className="w-5 h-5" />
      {/* Notification badge */}
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
    </button>
  )
}
