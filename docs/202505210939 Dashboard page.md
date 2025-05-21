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

In src/app/layout.tsx, wrap your content with a layout that later can include a basic navbar or sidebar:

```tsx
import Dashboard from "./page"

export default function DashboardLayout() {
  return (
    <>
      <Dashboard />
    </>
  )
}
```
