# CampusConnect – Student Activity Portal

A responsive MERN-style starter project for the CampusConnect lab guide. Students can explore a public home page, register and log in through validated forms, view a personalized dashboard, browse a searchable campus announcements noticeboard, and manage live tasks through an Express REST API backed by MongoDB/Mongoose when configured.

## Run locally

```bash
pnpm install
pnpm dev
```

The managed project scaffold supplies the React client, Express/tRPC server, Drizzle database integration, and authentication plumbing. The second lab extension adds `server/rest.ts`, Mongoose models, student/task CRUD routes, and the React REST client. See [`docs/architecture.md`](docs/architecture.md) and [`docs/backend-integration.md`](docs/backend-integration.md) for the task mapping and MongoDB setup.

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
