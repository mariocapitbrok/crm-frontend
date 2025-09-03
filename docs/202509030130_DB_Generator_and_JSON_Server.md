# DB Generator and JSON Server Setup

This repo includes a deterministic mock‐data generator and convenient scripts to serve the data with `json-server` or regenerate a static `db.json` snapshot for local development and demos.

## Files

- `scripts/db.js:1` — Dynamic data generator (all entities, seeded RNG, referential integrity).
- `scripts/generate-db.js:1` — Writes a static `db.json` using the same generator.
- `package.json:1` — Contains npm scripts for generating and serving data.

## Package Scripts

- `gen:db`: Generates `db.json` from the generator

  - Command: `node scripts/generate-db.js`

- `dev:api`: Serves static `db.json` on port 3001

  - Command: `json-server db.json --port 3001`

- `dev:api:routes`: Serves static `db.json` using custom routes

  - Command: `json-server db.json --routes routes.json --port 3001`

- `dev:api:regen`: Regenerate `db.json` then serve it

  - Command: `node scripts/generate-db.js && json-server db.json --port 3001`

- `dev:api:routes:regen`: Regenerate `db.json` then serve with routes
  - Command: `node scripts/generate-db.js && json-server db.json --routes routes.json --port 3001`

Note: Replace `pnpm` with `npm run` or `yarn` as needed for your environment.

## Quick Start

Generate a fresh database snapshot

```sh
pnpm gen:db
```

Serve the API from the static file (default port `3001`)

```sh
pnpm dev:api
# or with custom routes
pnpm dev:api:routes
```

One‑shot regenerate and serve

```sh
pnpm dev:api:regen
# or with routes
pnpm dev:api:routes:regen
```

## Deterministic Data (Seeding)

The generator is deterministic with `SEED`. Using the same seed yields the same dataset across runs, which is useful for consistent demos and tests.

```sh
SEED=123 pnpm gen:db
SEED=123 pnpm dev:api:regen
```

## Customizing the Dataset

- Record counts per entity: edit `COUNTS` in `scripts/db.js:1`.
- Field ranges and formats (e.g., names, amounts, addresses): adjust helper functions and builders in `scripts/db.js`.
- Relationships: the generator maintains consistent `*_id` references across entities (users, organizations, contacts, leads, deals, quotes → salesorders → invoices, and line items to products/services).

After changes, regenerate with `pnpm gen:db` (or use the `:regen` scripts) to apply your tweaks.

## Notes

- Default port is `3001`. Change with `--port` if needed.
- If using `routes.json`, keep it in the project root and call the `:routes` variants.
- The generator uses neutral, Lorem‑Ipsum–style names and placeholder addresses, avoiding domain‑specific or real data.
