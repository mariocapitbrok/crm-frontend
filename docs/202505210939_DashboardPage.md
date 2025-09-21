# Dashboard page

## Create the Dashboard Route

Create a folder named dashboard inside src/app/:

```sh
mkdir src/app/dashboard
touch src/app/dashboard/page.tsx
```

## Create the Dashboard Page Component

Then open src/app/dashboard/page.tsx and add:

```tsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your CRM Dashboard!</p>
    </div>
  )
}
```

## Create the Dashboard Layout file

In `src/app/layout.tsx`, the app shell wraps all routes. The global `NavBar` is rendered here so it appears on every page. The `NavBar` includes the `AppSidebar` (a sheet-based navigation drawer).

When adding or modifying sheets/dialogs, include a title and a description for accessibility (or explicitly opt out). Our components expose `SheetHeader` → `SheetTitle` + `SheetDescription` and the dialog equivalents.

Example minimal layout:

```tsx
export default function DashboardLayout() {
  return <>{/* children rendered by Next.js */}</>
}
```

Notes:
- Global nav: `src/app/layout.tsx` renders `@/app/_components/nav/NavBar` above `{children}`.
- Sidebar: `src/app/_components/nav/AppSidebar.tsx` uses `SheetHeader` + `SheetTitle` + `SheetDescription` (screen-reader only) to satisfy Radix Dialog a11y.
