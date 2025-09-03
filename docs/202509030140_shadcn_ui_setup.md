# shadcn/ui Setup Guide for Next.js CRM Project

This guide explains how to install and configure **shadcn/ui** for a Next.js (App Router) CRM project.

---

## 1. Prerequisites

- **Next.js 14+** with App Router (`app/` directory)
- **TypeScript** enabled
- **Tailwind CSS** installed and working

If you haven’t added Tailwind yet:

```bash
pnpm dlx create-next-app@latest my-crm-app --ts --tailwind
```

---

## 2. Install Required Dependencies

shadcn/ui relies on Tailwind and Radix UI primitives.

```bash
pnpm add tailwind-variants class-variance-authority lucide-react
```

Optional (recommended):

```bash
pnpm add sonner date-fns cmdk
```

- **sonner** → toasts/notifications
- **date-fns** → date manipulation for forms/calendar
- **cmdk** → command palette

---

## 3. Initialize shadcn/ui

Run the CLI tool to add the generator:

```bash
pnpm dlx shadcn@latest init
```

This will:

- Add a `components/` folder at the root of your project
- Create a `lib/utils.ts` helper (for `cn` class merge)
- Update `tailwind.config.ts`

---

## 4. Configure Tailwind

Ensure your `tailwind.config.ts` includes the **shadcn presets**:

```ts
import { type Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

Run:

```bash
pnpm dev
```

Confirm no Tailwind build errors.

---

## 5. Add Components

Use the CLI to copy components into your project:

```bash
pnpm shadcn-ui add button input label textarea select switch dialog dropdown-menu popover tooltip tabs sheet scroll-area table form calendar command badge breadcrumb toast
```

This copies **source code** into `components/ui/` so you fully own them.

---

## 6. Project Structure (Recommended)

```
components/
  ui/        # shadcn/ui components
  common/    # shared (Navbar, Sidebar, Breadcrumb, Loader)
features/
  users/
  deals/
  contacts/
  ...
lib/
  utils.ts
  dto/
```

---

## 7. Verify Installation

Example button:

```tsx
import { Button } from "@/components/ui/button"

export default function Page() {
  return <Button variant="default">Hello CRM</Button>
}
```

Start dev server:

```bash
pnpm dev
```

You should see a styled button.

---

## 8. Next Steps

- Add **DataTable** wrapper using TanStack Table.
- Set up **react-hook-form + zod** with shadcn/ui forms.
- Implement **global Command Palette** with `cmdk`.
- Add **Toast (sonner)** for feedback.

---

✅ Now your CRM project is ready to use **shadcn/ui** components!
