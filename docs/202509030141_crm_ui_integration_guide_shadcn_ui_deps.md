# CRM UI Integration Guide — shadcn/ui + deps

This guide shows **how each dependency integrates** into a Next.js CRM using **shadcn/ui**. It includes patterns and copy‑paste snippets for common modules: **Leads, Deals, Tickets, Activities, Documents**.

Dependencies covered:

- **class-variance-authority (CVA)** / **tailwind-variants** → variantable styles
- **lucide-react** → icons
- **sonner** → toasts
- **date-fns** → dates
- **cmdk** → command palette (via shadcn/ui `Command`)

> You can use **either** CVA **or** tailwind-variants. This doc shows CVA in most examples (shadcn/ui’s default), with a `tv` alternative once.

---

## 1) Project Layout (recap)

```js
app/
  (app)/
    layout.tsx
    dashboard/page.tsx
    users/...
    organizations/...
    contacts/...
    leads/...
    deals/...
    tickets/...
    products/...
    services/...
    vendors/...
    pricebooks/...
    quotes/...
    salesorders/...
    purchaseorders/...
    invoices/...
    campaigns/...
    activities/...
    documents/...
lib/
  db/ (ORM/repo)
  dto/ (zod schemas)
  auth/
  utils/
components/
  ui/        (shadcn/ui library copies)
  common/    (Nav, PageHeader, Breadcrumbs, EmptyState, Loader)
  data/      (DataTable, DataToolbar, ColumnToggle, Pagination)
  forms/     (Form, Field wrappers, DatePicker, ComboBox, FileDropzone)
features/
  deals/ (DealForm, DealTable, DealCard, hooks.ts)
  contacts/
  tickets/
  ...       (one per entity for domain composites)

```

---

## 2) Variantable Styles (CVA) for CRM primitives

Create **design tokens** and **reusable variants** for consistent UI.

### 2.1 Badge variants (deal stages, ticket priorities)

```ts
// components/common/badge-variants.ts
import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        success:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        info: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
        warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      },
      size: { sm: "text-[10px]", md: "text-xs" },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
)
```

**Usage**

```tsx
<span className={badgeVariants({ tone: "info" })}>Prospecting</span>
<span className={badgeVariants({ tone: "warn" })}>High Priority</span>
```

### 2.2 Button variants with `tv` (tailwind-variants alternative)

```ts
// components/common/button-tv.ts
import { tv } from "tailwind-variants"

export const btn = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium disabled:opacity-50",
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border bg-background hover:bg-accent",
      ghost: "hover:bg-accent",
    },
    size: { sm: "h-8 px-3", md: "h-9 px-4", lg: "h-10 px-6" },
  },
  defaultVariants: { variant: "primary", size: "md" },
})
```

---

## 3) Icons (lucide-react) mapping

Create a central map so features can import icons by semantic name.

```ts
// components/common/icons.ts
export {
  User,
  Users,
  Building2 as Organization,
  Contact,
  Handshake as Deal,
  Ticket,
  Calendar,
  FileText as Document,
  Plus,
  Edit,
  Trash2 as Delete,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react"
```

**Usage**

```tsx
import { Deal, Plus } from "@/components/common/icons"

<Deal className="h-4 w-4" />
<button className="inline-flex items-center gap-2">
  <Plus className="h-4 w-4"/> New Deal
</button>
```

---

## 4) Toasts (sonner): CRUD feedback pattern

Add a single Toaster near the root (e.g., in `app/(app)/layout.tsx`).

```tsx
// app/(app)/layout.tsx (excerpt)
import { Toaster } from "sonner"
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* App shell here */}
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}
```

**Feature usage**

```tsx
import { toast } from "sonner"

async function onCreateLead(data: any) {
  const t = toast.loading("Creating lead…")
  try {
    // await api.leads.create(data)
    toast.success("Lead created", { id: t })
  } catch (e) {
    toast.error("Failed to create lead", { id: t })
  }
}
```

---

## 4.1 App Shell: Global Nav + Sidebar

Place shared chrome in the root layout so it renders across routes.

- Global nav: `src/app/layout.tsx` renders `@/app/_components/nav/NavBar` above `{children}`.
- Sidebar: `src/app/_components/nav/AppSidebar.tsx` is a `Sheet` (Radix Dialog) with a header and a screen-reader description for accessibility.

```tsx
// src/app/layout.tsx (excerpt)
import NavBar from "@/app/_components/nav/NavBar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
```

```tsx
// src/app/_components/nav/AppSidebar.tsx (excerpt)
<Sheet>
  <SheetTrigger>{/* button */}</SheetTrigger>
  <SheetContent side="left" className="p-0 w-72">
    <SheetHeader className="px-4 py-3 border-b">
      <SheetTitle>Navigation</SheetTitle>
      <SheetDescription className="sr-only">
        Application navigation drawer with links to primary sections.
      </SheetDescription>
    </SheetHeader>
    {/* nav links */}
  </SheetContent>
 </Sheet>
```

---

## 5) Dates (date-fns): format + filters

Common helpers for formatting and ranges.

```ts
// lib/date.ts
import {
  format,
  parseISO,
  isBefore,
  isAfter,
  addDays,
  startOfWeek,
  endOfWeek,
} from "date-fns"

export const fmt = (d: Date | string, f = "MMM d, yyyy") =>
  format(typeof d === "string" ? parseISO(d) : d, f)

export const thisWeek = () => ({
  from: startOfWeek(new Date(), { weekStartsOn: 1 }),
  to: endOfWeek(new Date(), { weekStartsOn: 1 }),
})

export const within = (d: Date, range: { from: Date; to: Date }) =>
  !isBefore(d, range.from) && !isAfter(d, range.to)
```

**Usage**

```tsx
import { fmt, thisWeek } from "@/lib/date"

;<span>Due: {fmt("2025-09-20")}</span>
const range = thisWeek()
```

---

## 6) Command Palette (cmdk via shadcn/ui `Command`)

Provide **global search & actions** across modules.

```tsx
// components/common/command-menu.tsx
"use client"
import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
        setOpen((o) => !o)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search contacts, deals, tickets…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => router.push("/deals")}>
              Deals
            </CommandItem>
            <CommandItem onSelect={() => router.push("/contacts")}>
              Contacts
            </CommandItem>
            <CommandItem onSelect={() => router.push("/tickets")}>
              Tickets
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Quick Create">
            <CommandItem onSelect={() => router.push("/leads/new")}>
              New Lead
            </CommandItem>
            <CommandItem onSelect={() => router.push("/deals/new")}>
              New Deal
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

---

## 7) Module Patterns

### 7.1 Leads

**UI Needs**: list + quick create, convert to Contact/Deal.

```tsx
// features/leads/LeadToolbar.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "@/components/common/icons"

export function LeadToolbar({
  onSearch,
  onCreate,
}: {
  onSearch: (q: string) => void
  onCreate: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 w-64"
          placeholder="Search leads…"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" /> New Lead
      </Button>
    </div>
  )
}
```

**Feedback** (sonner) on create/convert; **Badges** (CVA) for `status: New, Working, Qualified`.

### 7.2 Deals

**UI Needs**: stages, amount, owner, pipeline view.

```tsx
// features/deals/StageBadge.tsx
import { badgeVariants } from "@/components/common/badge-variants"
const tones: Record<string, any> = {
  Prospecting: "info",
  Qualification: "info",
  Proposal: "warn",
  Won: "success",
  Lost: "danger",
}
export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={badgeVariants({ tone: tones[stage] ?? "neutral" })}>
      {stage}
    </span>
  )
}
```

**Dates**: `closeDate` formatted with `fmt()`; **Toasts** on stage change; **Icons** in table actions.

### 7.3 Tickets

**UI Needs**: priority, SLA, status.

```tsx
// features/tickets/PriorityBadge.tsx
import { badgeVariants } from "@/components/common/badge-variants"
export function PriorityBadge({
  p,
}: {
  p: "Low" | "Medium" | "High" | "Urgent"
}) {
  const map = {
    Low: "neutral",
    Medium: "info",
    High: "warn",
    Urgent: "danger",
  } as const
  return <span className={badgeVariants({ tone: map[p] })}>{p}</span>
}
```

Use **toast** on assignment/reply; use **CommandMenu** to jump to open tickets.

### 7.4 Activities

**UI Needs**: date pickers, list/calendar, quick log.

```tsx
// features/activities/ActivityForm.tsx (excerpt)
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export function DueDatePicker({
  value,
  onChange,
}: {
  value: Date | undefined
  onChange: (d: Date) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {value ? format(value, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => d && onChange(d)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
```

### 7.5 Documents

**UI Needs**: upload, preview, metadata.

Use **Icons** (`FileText`, `Trash2`), **Toasts** on upload/delete, and **Badges** for file type. Use `fmt()` for `uploadedAt`.

---

## 8) Data Table Integration (snippet)

Use shadcn/ui `Table` + TanStack Table and reuse toolbar across modules.

```tsx
// components/data/DataTableShell.tsx (excerpt)
"use client"
import { Table } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/common/icons"

export function DataTableShell({ children, onSearch }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-72"
            placeholder="Search…"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>
      <div className="rounded-xl border">
        <Table>{children}</Table>
      </div>
    </div>
  )
}
```

---

## 9) Accessibility & Keyboard

- All interactive pieces should be shadcn/ui (Radix-based) for **focus trapping** and **ARIA**.
- Add keyboard shortcuts in **CommandMenu** and page-level handlers (`/` focus search, `n` for new record).

---

## 10) Quick Checklist per Feature

- **Leads**: Toolbar + New dialog; badges for status; toast on convert.
- **Deals**: StageBadge; amount formatting; close date via DatePicker; toast on stage change.
- **Tickets**: PriorityBadge; SLA chip; Assign with Combobox; toast on reply.
- **Activities**: Calendar picker; list w/ date grouping; toast on log.
- **Documents**: Upload dropzone; filetype badge; delete confirmation (AlertDialog) + toast.

---

### Done

You now have a cohesive integration plan for **CVA/tv**, **lucide-react**, **sonner**, **date-fns**, and **cmdk** across the CRM modules. Copy the snippets into your project, and iterate module by module.
---

## 7) Accessibility: Dialog and Sheet

Radix Dialog requires a title and description for accessible labeling. Use shadcn/ui wrappers:

- Dialog: `DialogHeader` → `DialogTitle` + `DialogDescription`
- Sheet: `SheetHeader` → `SheetTitle` + `SheetDescription`

```tsx
// Dialog example
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Lead</DialogTitle>
      <DialogDescription className="sr-only">
        Fill out the fields and save to add the lead.
      </DialogDescription>
    </DialogHeader>
    {/* form */}
  </DialogContent>
</Dialog>
```

Our wrappers also support passing `aria-describedby` manually, but including a `*Description` element is recommended for consistency and a11y.
