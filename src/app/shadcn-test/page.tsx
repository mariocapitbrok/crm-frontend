"use client"

import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="m-8 space-y-4">
      <div className="h-40 rounded-xl bg-primary text-primary-foreground p-6">
        Tailwind + shadcn tokens working
      </div>

      <div className="flex gap-3">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </div>
  )
}
