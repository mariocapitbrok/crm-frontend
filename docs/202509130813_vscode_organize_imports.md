# Organize Imports on Save (VS Code)

Enable VS Code to automatically organize imports whenever you save files.

## Recommended Setup

Add a workspace settings file at `.vscode/settings.json` with:

```json
{
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "editor.codeActionsOnSaveMode": "explicit"
}
```

### Scope to TS/JS only (optional)

```json
{
  "[typescript]": {
    "editor.codeActionsOnSave": { "source.organizeImports": true }
  },
  "[javascript]": {
    "editor.codeActionsOnSave": { "source.organizeImports": true }
  },
  "editor.codeActionsOnSaveMode": "explicit"
}
```

## Save Mode

- `explicit`: Runs on manual saves (Ctrl/Cmd+S). Avoids churn with auto‑save.
- `all`: Runs on both manual saves and auto‑save. Use if you want it always.

## Notes

- Prettier: Format on save does not organize imports. Keep the setting above even if you use Prettier.
- ESLint alternative: Prefer ESLint to handle sorting? Use `eslint-plugin-simple-import-sort` and enable:

  ```json
  {
    "editor.codeActionsOnSave": { "source.fixAll.eslint": true }
  }
  ```

  Do not enable both VS Code organize and ESLint sorters simultaneously to avoid conflicts.

