# 🚀 JSON-Server Quick Installation & Usage Guide

## 1. Install

```bash
# Global install
pnpm add -g json-server

# Or as a dev dependency (preferred)
pnpm add -D json-server
```

---

## 2. Create a Database File

Create a file named `db.json`:

```json
{
  "posts": [{ "id": 1, "title": "Hello World", "author": "Mario" }],
  "comments": [{ "id": 1, "body": "Great post!", "postId": 1 }]
}
```

---

## 3. Start the Server

```bash
pnpm json-server --watch db.json --port 3001
```

- Default endpoint: `http://localhost:3001`

---

## 4. Example Endpoints

- **GET** `/posts` → all posts
- **GET** `/posts/1` → post by ID
- **POST** `/posts` → add a post
- **PATCH** `/posts/1` → update part of a post
- **DELETE** `/posts/1` → remove a post

---

## 5. Useful package.json Scripts

```json
{
  "scripts": {
    "dev:api": "json-server --watch db.json --port 3001"
  }
}
```

Run with:

```bash
pnpm dev:api
```

---

## 6. Quick Customization

- **Custom routes**: `pnpm json-server --watch db.json --routes routes.json`
- **Delay responses**: `pnpm json-server --watch db.json --delay 500`
- **Read-only mode**: `pnpm json-server --watch db.json --read-only`

---

## 7. Using routes.json (Custom Routes)

If you want pretty or legacy-style endpoints that map to resources in `db.json`, add a `routes.json` file.

Example `routes.json`:

```json
{
  "/Accounts": "/organizations",
  "/Contacts": "/contacts",
  "/Deals": "/deals"
}
```

Run with routes enabled:

```bash
pnpm json-server --watch db.json --routes routes.json --port 3001
```

Add a convenient script to `package.json`:

```json
{
  "scripts": {
    "dev:api:routes": "json-server --watch db.json --routes routes.json --port 3001"
  }
}
```

Then start it with:

```bash
pnpm dev:api:routes
```

Notes:

- Keys in `routes.json` are matched as paths and are case-sensitive.
- Mapped values must point to collections present in `db.json`.

---

✅ You now have a mock REST API running in seconds!
