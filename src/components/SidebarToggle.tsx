import { Menu } from "lucide-react";

export default function SidebarToggle() {
  return (
    <button className="p-2 hover:bg-gray-700 rounded hover:text-white">
      <Menu className="w-5 h-5" />
    </button>
  );
}
