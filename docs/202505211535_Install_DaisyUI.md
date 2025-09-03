# Install Daisy UI.

Follow main instructions
https://daisyui.com/docs/install/

If you already installed Tailwind in Next.js then just

## Install de dependency

```sh
pnpm add -D daisyui@latest
```

## Update app/globals.css file

```css
@import "tailwindcss";
@plugin "daisyui";
```

Is possible that you see an "Unknown lint" in that case just update your Workspace settings.

```json
{
  ...
  "css.lint.unknownAtRules": "ignore",
}
```

## Test if DaisyUI is working

```tsx
import Dashboard from "./page"

export default function DashboardLayout() {
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {/* ✅ DaisyUI test button */}
        <button className="btn btn-primary">Test DaisyUI Button</button>
        <Dashboard />
      </div>
    </>
  )
}
```
