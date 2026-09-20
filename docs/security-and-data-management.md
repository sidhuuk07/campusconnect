# CampusConnect Security and Data Management

This extension implements the third CampusConnect lab: password hashing, JWT authentication, protected APIs, role-aware user data, student search, task filtering, and maintainable typed client contracts.

## Authentication flow

1. Registration validates name, email, and password length in React and again in Express.
2. The server hashes passwords with `bcryptjs` before storing them. Password fields are excluded from normal Mongoose queries with `select: false`.
3. Successful registration and login return a short-lived JWT containing user identity and role claims.
4. The React API client stores the token in `localStorage` for this lab and adds it as a Bearer token to protected requests.
5. `requireAuth` verifies the signature and expiry before allowing access to dashboard-related endpoints.
6. Invalid, missing, or expired tokens return HTTP 401 with a user-friendly message.

For production, move the token to an httpOnly secure cookie, rotate the signing secret, add refresh-token handling, and add rate limiting to authentication endpoints.

## Protected resources

The following endpoints require a valid JWT: `GET/PUT/DELETE /api/students`, `GET/POST/PUT/DELETE /api/tasks`, and `GET /api/auth/me`. `POST /api/students`, `POST /api/auth/login`, and `/api/health` remain public. The dashboard checks for a client session before rendering private data and shows a clear login gate otherwise.

## Role design

The standard user structure includes `id`, `name`, `email`, `role`, and `registrationDate`, while authentication data remains server-controlled. Supported roles are:

| Role | Intended access |
| --- | --- |
| Student | Personal dashboard, own task activity, student directory search |
| Faculty | Student/task oversight for assigned academic groups |
| Administrator | User, task, announcement, and platform configuration management |

`requireRole` is available as middleware for future faculty and administrator routes.

## Search and filtering

Students can be searched by name or email using `GET /api/students?search=...`. Tasks support status, owner, and creation-date filters through `GET /api/tasks?status=completed&owner=Alex&createdAfter=2025-10-01`. The React dashboard applies these filters dynamically and refreshes the displayed results.

The task board also demonstrates array and object data operations: status cycling, filtered rendering, completed-task styling, task counts, and local state updates after create/update/delete responses.

## Verification

The security suite covers JWT creation and verification, unauthorized task rejection, authenticated task CRUD, API health, announcement behavior, auth logout, TypeScript checks, and the production build.
