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

Tailwind v4 does not require a tailwind.config.(js|ts) file. Configure Tailwind and shadcn tokens in CSS (your src/app/globals.css).

### 1. Ensure the top of src/app/globals.css has the v4 directives/plugins:

```css
@import "tailwindcss";
@import "tw-animate-css"; /* animations for shadcn */
/* If you're also using DaisyUI, keep this: */
/* @plugin "daisyui"; */

/* Optional: define how dark mode is toggled via the `dark:` variant */
@custom-variant dark (&:is(.dark *));
```

### 2. Map shadcn semantic colors to Tailwind v4 color tokens with @theme:

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}
```

### 3. Define your light/dark theme tokens (you can customize the HSL values to match your brand):

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 4. Run the dev server and verify:

```bash
pnpm dev
```

Drop a test element

```tsx
<div className="m-8 h-40 rounded-xl bg-primary text-primary-foreground p-6">
  Tailwind v4 + shadcn tokens working
</div>
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
