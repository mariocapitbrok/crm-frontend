import { Sun, Moon } from "lucide-react"

export default function ThemeSwitcher({ isDark }: { isDark: boolean }) {
  return (
    <button className="p-2 hover:bg-gray-700 rounded  hover:text-white">
      {isDark ? <Moon className="w-5 h-5 " /> : <Sun className="w-5 h-5" />}
    </button>
  )
}
