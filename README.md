# CampusConnect – Student Activity Portal

A responsive MERN-style starter project for the CampusConnect lab guide. Students can explore a public home page, register and log in through validated forms, view a personalized dashboard, and browse a searchable campus announcements noticeboard.

## Run locally

```bash
pnpm install
pnpm dev
```

The managed project scaffold supplies the React client, Express/tRPC server, Drizzle database integration, and authentication plumbing. See [`docs/architecture.md`](docs/architecture.md) for the task mapping and the path to a database-backed production implementation.

## Routes

- `/` – public home page
- `/login` – login form with validation and demo success state
- `/register` – registration form with validation and demo success state
- `/dashboard` – student activity dashboard
- `/announcements` – dynamic, searchable, filterable announcement collection

## Checks

```bash
pnpm check
pnpm test
pnpm build
```
