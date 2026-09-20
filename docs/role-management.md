# Faculty and Administrator Management

CampusConnect now includes a protected `/management` workspace for faculty members and administrators.

## Permissions

| Capability | Student | Faculty | Administrator |
| --- | ---: | ---: | ---: |
| View personal dashboard | Yes | Yes | Yes |
| View management overview | No | Yes | Yes |
| Review students and tasks | No | Yes | Yes |
| Assign tasks | No | Yes | Yes |
| Change user roles | No | No | Yes |

The backend enforces the same rules with `requireAuth` and `requireRole`, so hiding a UI control is not the security boundary. Faculty and administrators can call `GET /api/management/overview`; only administrators can call `PUT /api/management/students/:id/role`; faculty and administrators can call `PUT /api/management/tasks/:id/assignment`.

## Role model

New users start with the `student` role. MongoDB administrators can promote a user to `faculty` or `admin` through a controlled administrative workflow. The management UI reads the authenticated role from `/api/auth/me`, displays the correct workspace label, shows role selectors only to administrators, and shows assignment controls to faculty and administrators.

The automated REST suite verifies that a faculty token can load the management overview but receives HTTP 403 when attempting to change a user role.
