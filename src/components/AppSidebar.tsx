"use client"

import { Home, Users, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function AppSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open sidebar">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 py-2">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" />
              Customers
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

