# CampusConnect Architecture

CampusConnect is a MERN-style student activity management portal. The current starter uses the managed full-stack scaffold: React + TypeScript + Vite on the client, an Express/tRPC API layer on the server, and Drizzle/MySQL support ready for persistence. The UI intentionally uses a mock-first data flow so the lab can be explored without database setup while the production path remains clearly defined.

## Project map

| Area | Location | Purpose |
| --- | --- | --- |
| React client | `client/` | Pages, reusable components, routing, styling, and form state |
| API server | `server/` | tRPC procedures, authentication plumbing, database helpers, and tests |
| Shared types | `shared/` | Cross-layer constants and shared data contracts |
| Database | `drizzle/` | Schema, migrations, and Drizzle configuration |
| Documentation | `docs/` | Architecture notes and implementation guidance |
| Static assets | `static-assets/` | Reserved for small, non-generated assets used during development |

## Implemented lab tasks

- **Project initialization:** separate client and server applications are provided by the full-stack scaffold.
- **Pages:** Home, Login, Registration, Dashboard, and Announcements routes are implemented.
- **Reusable components:** `AppShell`, `BrandMark`, `Field`, `StatCard`, `AnnouncementCard`, `ScheduleRow`, and progress components are shared across pages.
- **Responsive styling:** the interface uses mobile-first Tailwind utilities, semantic color tokens, visible focus states, and responsive grids.
- **Form management:** registration and login forms use React state and update on every input change.
- **Validation:** required fields, email format, password length, and password confirmation are validated with meaningful inline feedback.
- **Conditional rendering:** success states, validation messages, loading skeletons, filtered empty states, and responsive navigation are included.
- **Dynamic data rendering:** announcements are kept in a typed collection, assigned stable IDs, returned by `announcements.list`, and rendered through reusable cards.
- **Routing:** wouter provides client-side navigation without full page refreshes.
- **Common layout:** all pages use the shared header, navigation, content area, and footer from `AppShell`.

## API integration path

`server/routers.ts` exposes `announcements.list` as a public tRPC query. The client hook in `client/src/hooks/useAnnouncements.ts` requests that procedure and falls back to the same mock collection when the API is unavailable during local preview. Replace the in-memory collection with a Drizzle query when the announcements table is introduced. Authentication can use the scaffolded Manus OAuth flow or be replaced with a university identity provider without changing page-level component contracts.

## Useful commands

```bash
pnpm dev       # Start the managed development server
pnpm check     # Run TypeScript validation
pnpm test      # Run Vitest tests
pnpm build     # Create a production client and server build
```

## Suggested next production steps

Create an `announcements` table in `drizzle/schema.ts`, add query helpers in `server/db.ts`, and replace the in-memory router data with a database-backed procedure. Add a protected registration/profile procedure once the university identity and password policy are finalized. Add end-to-end tests for route transitions, form validation, and authenticated dashboard access.
