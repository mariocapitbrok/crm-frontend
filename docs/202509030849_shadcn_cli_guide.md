# shadcn/ui CLI Guide

This is a quick reference for using the **shadcn/ui CLI** in your Next.js + Tailwind v4 project.

---

## 1. Overview

The shadcn CLI helps you:

- Initialize shadcn in your project.
- Add new UI components.
- List available components.
- Diff your local components against upstream templates.

---

## 2. Package.json Scripts

To simplify usage, add these scripts to your **package.json**:

```json
{
  "scripts": {
    "shadcn": "pnpm dlx shadcn-ui@latest",
    "shadcn:list": "pnpm dlx shadcn-ui@latest list",
    "shadcn:add": "pnpm dlx shadcn-ui@latest add",
    "shadcn:diff": "pnpm dlx shadcn-ui@latest diff"
  }
}
```

---

## 3. Commands

### 3.1 Init (run once per project)

```bash
pnpm shadcn init
```

- Sets up `components.json`.
- Creates `src/lib/utils.ts`.
- Updates your `globals.css` with color tokens.

### 3.2 Add Components

```bash
pnpm shadcn:add button dialog form
```

- Copies the components into `src/components/ui`.
- Example: `button.tsx`, `dialog.tsx`, etc.

### 3.3 List Available Components

```bash
pnpm shadcn:list
```

- Shows all components you can add.

### 3.4 Diff Components

```bash
pnpm shadcn:diff button
```

- Compares your local version with the latest upstream template.
- Helps you keep components updated.

---

## 4. Recommended Workflow

1. **Initialize once:** `pnpm shadcn init`
2. **When building features:** `pnpm shadcn:add dialog table toast`
3. **Explore components:** `pnpm shadcn:list`
4. **Stay up to date:** `pnpm shadcn:diff button`

---

✅ With these scripts, managing shadcn components in your CRM project becomes faster and easier.
