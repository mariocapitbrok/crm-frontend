import { Button } from "./ui/button"

const LeadsMenu = () => {
  const menus = [
    "File",
    "Edit",
    "View",
    "Insert",
    "Format",
    "Data",
    "Tools",
    "Extensions",
    "Help",
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 pt-1">
      {menus.map((label) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="h-8 px-2 first:pl-0 text-[13px] font-normal"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export default LeadsMenu
