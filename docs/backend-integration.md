# CampusConnect Backend and Full-Stack Integration

This extension implements the second CampusConnect lab: Express REST APIs, MongoDB/Mongoose models, CRUD operations, validation, and React integration.

## Backend structure

| File | Purpose |
| --- | --- |
| `server/_core/index.ts` | Registers JSON middleware and mounts the REST API in the existing Express process |
| `server/rest.ts` | Student and task REST routes, request validation, structured responses, and in-memory preview fallback |
| `server/models.ts` | Mongoose `Student` and `Task` schemas plus MongoDB connection helper |
| `client/src/lib/api.ts` | Typed browser client for the REST endpoints |
| `client/src/components/TaskBoard.tsx` | Dashboard task CRUD interface |

## MongoDB configuration

Set one of these environment variables before starting the server:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/campusconnect
# or
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/campusconnect
```

When no URI is configured, the API remains usable in preview through an in-memory store. This makes the lab UI testable without hiding the production database path. Data in memory resets when the server restarts. With MongoDB configured, records persist through Mongoose.

> The registration example intentionally stores no password in API responses. Before production, replace the lab-only password field with a strong password-hashing flow and add authentication/session controls.

## REST endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API availability and database mode |
| `POST` | `/api/students` | Validate and create a student |
| `GET` | `/api/students` | Retrieve students |
| `PUT` | `/api/students/:id` | Update student name and email |
| `DELETE` | `/api/students/:id` | Delete a student |
| `POST` | `/api/tasks` | Create a task or activity |
| `GET` | `/api/tasks` | Retrieve tasks |
| `PUT` | `/api/tasks/:id` | Update task details or status |
| `DELETE` | `/api/tasks/:id` | Delete a task |

All responses use a consistent shape such as `{ success: true, message, data }` or `{ success: false, message }`. Validation failures return HTTP 400, duplicate records return 409, missing records return 404, and successful creation returns 201.

## React integration

The registration form now submits to `POST /api/students` and displays backend success/error states. The dashboard task board loads from `GET /api/tasks`, creates tasks, cycles task status through `PUT`, and deletes tasks through `DELETE`. The interface refreshes local React state after each successful response, so new records appear without a page refresh.

## Verification

Run the full lab checks:

```bash
pnpm check
pnpm test
pnpm build
```

The REST test suite covers health reporting and task create/update/list/delete behavior. The existing announcement and auth tests remain in place.
