import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { connectMongo, serializeDocument, StudentModel, TaskModel } from "./models";
import { createToken, requireAuth, requireRole, type AuthUser } from "./auth";

type Student = { id: string; name: string; email: string; role: AuthUser["role"]; registrationDate: string };
type Task = { id: string; title: string; description: string; status: "todo" | "in-progress" | "completed"; assignedUser?: string; createdDate: string };

const memoryStudents: Student[] = [];
const memoryCredentials = new Map<string, { passwordHash: string; studentId: string }>();
const memoryTasks: Task[] = [
  { id: "task-welcome", title: "Explore the student societies", description: "Find one club or society that matches your interests.", status: "in-progress", assignedUser: "Alex Morgan", createdDate: new Date().toISOString() },
  { id: "task-profile", title: "Complete your CampusConnect profile", description: "Add your interests so we can personalize your opportunities.", status: "todo", assignedUser: "Alex Morgan", createdDate: new Date().toISOString() },
];

function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message });
}

function validEmail(value: unknown) { return typeof value === "string" && /^\S+@\S+\.\S+$/.test(value); }
function getId(req: Request) { return req.params.id; }

export function registerRestApi(app: Express) {
  app.use("/api", async (_req, _res, next) => { await connectMongo(); next(); });

  app.get("/api/health", (_req, res) => res.json({ success: true, service: "campusconnect-api", database: process.env.MONGO_URI || process.env.MONGODB_URI ? "configured" : "memory-fallback" }));

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!validEmail(email) || typeof password !== "string" || !password) return sendError(res, 400, "Email and password are required.");
    try {
      let user: AuthUser | null = null;
      let passwordHash = "";
      if (StudentModel.db.readyState === 1) {
        const stored = await StudentModel.findOne({ email: email.toLowerCase() }).select("+password");
        if (stored) { user = { id: String(stored._id), email: stored.email, name: stored.name, role: stored.role }; passwordHash = stored.password; }
      } else {
        const stored = memoryCredentials.get(email.toLowerCase());
        const student = memoryStudents.find(item => item.email === email.toLowerCase());
        if (stored && student) { user = { id: student.id, email: student.email, name: student.name, role: student.role }; passwordHash = stored.passwordHash; }
      }
      if (!user || !(await bcrypt.compare(password, passwordHash))) return sendError(res, 401, "Email or password is incorrect.");
      return res.json({ success: true, message: "Login successful.", data: { token: await createToken(user), user } });
    } catch (error) { return sendError(res, 500, error instanceof Error ? error.message : "Unable to log in."); }
  });

  app.get("/api/auth/me", requireAuth, (_req, res) => res.json({ success: true, data: res.locals.user }));

  app.post("/api/students", async (req, res) => {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length < 2) return sendError(res, 400, "Name must contain at least 2 characters.");
    if (!validEmail(email)) return sendError(res, 400, "A valid email address is required.");
    if (typeof password !== "string" || password.length < 8) return sendError(res, 400, "Password must contain at least 8 characters.");
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      if (StudentModel.db.readyState === 1) {
        const created = await StudentModel.create({ name, email, password: passwordHash, role: "student" });
        const user = { id: String(created._id), name: created.name, email: created.email, role: created.role as AuthUser["role"] };
        return res.status(201).json({ success: true, message: "Student registered successfully.", data: { ...user, token: await createToken(user) } });
      }
      if (memoryStudents.some(student => student.email === email.toLowerCase())) return sendError(res, 409, "A student with this email already exists.");
      const created = { id: `student-${Date.now()}`, name: name.trim(), email: email.toLowerCase(), role: "student" as const, registrationDate: new Date().toISOString() };
      memoryStudents.push(created);
      memoryCredentials.set(created.email, { passwordHash, studentId: created.id });
      return res.status(201).json({ success: true, message: "Student registered successfully.", data: { ...created, token: await createToken(created) } });
    } catch (error) { return sendError(res, 400, error instanceof Error ? error.message : "Unable to register student."); }
  });

  app.get("/api/students", requireAuth, async (req, res) => {
    const search = String(req.query.search || "").trim();
    if (StudentModel.db.readyState === 1) {
      const filter = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};
      const students = await StudentModel.find(filter).sort({ registrationDate: -1 }).lean();
      return res.json({ success: true, data: students.map(student => serializeDocument(student as unknown as Record<string, unknown>)) });
    }
    const lowered = search.toLowerCase();
    return res.json({ success: true, data: memoryStudents.filter(student => !lowered || student.name.toLowerCase().includes(lowered) || student.email.includes(lowered)) });
  });

  app.put("/api/students/:id", requireAuth, async (req, res) => {
    const { name, email } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length < 2 || !validEmail(email)) return sendError(res, 400, "Name and a valid email are required.");
    if (StudentModel.db.readyState === 1) {
      const updated = await StudentModel.findByIdAndUpdate(getId(req), { name: name.trim(), email: email.toLowerCase() }, { new: true, runValidators: true }).lean();
      return updated ? res.json({ success: true, message: "Student updated successfully.", data: serializeDocument(updated as unknown as Record<string, unknown>) }) : sendError(res, 404, "Student not found.");
    }
    const index = memoryStudents.findIndex(student => student.id === getId(req));
    if (index < 0) return sendError(res, 404, "Student not found.");
    memoryStudents[index] = { ...memoryStudents[index], name: name.trim(), email: email.toLowerCase() };
    return res.json({ success: true, message: "Student updated successfully.", data: memoryStudents[index] });
  });

  app.delete("/api/students/:id", requireAuth, async (req, res) => {
    if (StudentModel.db.readyState === 1) {
      const deleted = await StudentModel.findByIdAndDelete(getId(req));
      return deleted ? res.json({ success: true, message: "Student deleted successfully." }) : sendError(res, 404, "Student not found.");
    }
    const index = memoryStudents.findIndex(student => student.id === getId(req));
    if (index < 0) return sendError(res, 404, "Student not found.");
    memoryStudents.splice(index, 1);
    return res.json({ success: true, message: "Student deleted successfully." });
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    const { title, description = "", status = "todo", assignedUser } = req.body ?? {};
    if (typeof title !== "string" || title.trim().length < 2) return sendError(res, 400, "Task title must contain at least 2 characters.");
    if (!["todo", "in-progress", "completed"].includes(status)) return sendError(res, 400, "Task status is invalid.");
    if (TaskModel.db.readyState === 1) {
      const created = await TaskModel.create({ title, description, status, assignedUser });
      return res.status(201).json({ success: true, message: "Task created successfully.", data: serializeDocument(created.toObject() as unknown as Record<string, unknown>) });
    }
    const created: Task = { id: `task-${Date.now()}`, title: title.trim(), description: String(description), status, assignedUser, createdDate: new Date().toISOString() };
    memoryTasks.unshift(created);
    return res.status(201).json({ success: true, message: "Task created successfully.", data: created });
  });

  app.get("/api/tasks", requireAuth, async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const owner = typeof req.query.owner === "string" ? req.query.owner.toLowerCase() : "";
    const createdAfter = typeof req.query.createdAfter === "string" ? new Date(req.query.createdAfter) : null;
    if (TaskModel.db.readyState === 1) {
      const filter: Record<string, unknown> = { ...(status && status !== "all" ? { status } : {}), ...(owner ? { assignedUser: { $regex: owner, $options: "i" } } : {}), ...(createdAfter && !Number.isNaN(createdAfter.getTime()) ? { createdDate: { $gte: createdAfter } } : {}) };
      const tasks = await TaskModel.find(filter).sort({ createdDate: -1 }).lean();
      return res.json({ success: true, data: tasks.map(task => serializeDocument(task as unknown as Record<string, unknown>)) });
    }
    return res.json({ success: true, data: memoryTasks.filter(task => (!status || status === "all" || task.status === status) && (!owner || (task.assignedUser || "").toLowerCase().includes(owner)) && (!createdAfter || new Date(task.createdDate) >= createdAfter)) });
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    const { title, description, status, assignedUser } = req.body ?? {};
    if (status !== undefined && !["todo", "in-progress", "completed"].includes(status)) return sendError(res, 400, "Task status is invalid.");
    const update = { ...(title !== undefined ? { title, description, status, assignedUser } : { description, status, assignedUser }) };
    if (TaskModel.db.readyState === 1) {
      const updated = await TaskModel.findByIdAndUpdate(getId(req), update, { new: true, runValidators: true }).lean();
      return updated ? res.json({ success: true, message: "Task updated successfully.", data: serializeDocument(updated as unknown as Record<string, unknown>) }) : sendError(res, 404, "Task not found.");
    }
    const index = memoryTasks.findIndex(task => task.id === getId(req));
    if (index < 0) return sendError(res, 404, "Task not found.");
    memoryTasks[index] = { ...memoryTasks[index], ...update } as Task;
    return res.json({ success: true, message: "Task updated successfully.", data: memoryTasks[index] });
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    if (TaskModel.db.readyState === 1) {
      const deleted = await TaskModel.findByIdAndDelete(getId(req));
      return deleted ? res.json({ success: true, message: "Task deleted successfully." }) : sendError(res, 404, "Task not found.");
    }
    const index = memoryTasks.findIndex(task => task.id === getId(req));
    if (index < 0) return sendError(res, 404, "Task not found.");
    memoryTasks.splice(index, 1);
    return res.json({ success: true, message: "Task deleted successfully." });
  });

  app.get("/api/management/overview", requireAuth, requireRole("faculty", "admin"), async (_req, res) => {
    if (StudentModel.db.readyState === 1) {
      const [students, tasks, completedTasks] = await Promise.all([StudentModel.find().sort({ registrationDate: -1 }).lean(), TaskModel.find().sort({ createdDate: -1 }).lean(), TaskModel.countDocuments({ status: "completed" })]);
      return res.json({ success: true, data: { students: students.map(student => serializeDocument(student as unknown as Record<string, unknown>)), tasks: tasks.map(task => serializeDocument(task as unknown as Record<string, unknown>)), summary: { students: students.length, tasks: tasks.length, completedTasks } } });
    }
    return res.json({ success: true, data: { students: memoryStudents, tasks: memoryTasks, summary: { students: memoryStudents.length, tasks: memoryTasks.length, completedTasks: memoryTasks.filter(task => task.status === "completed").length } } });
  });

  app.put("/api/management/students/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
    const role = req.body?.role;
    if (!["student", "faculty", "admin"].includes(role)) return sendError(res, 400, "Role must be student, faculty, or admin.");
    if (StudentModel.db.readyState === 1) {
      const updated = await StudentModel.findByIdAndUpdate(getId(req), { role }, { new: true, runValidators: true }).lean();
      return updated ? res.json({ success: true, message: "User role updated successfully.", data: serializeDocument(updated as unknown as Record<string, unknown>) }) : sendError(res, 404, "Student not found.");
    }
    const index = memoryStudents.findIndex(student => student.id === getId(req));
    if (index < 0) return sendError(res, 404, "Student not found.");
    memoryStudents[index] = { ...memoryStudents[index], role } as Student;
    return res.json({ success: true, message: "User role updated successfully.", data: memoryStudents[index] });
  });

  app.put("/api/management/tasks/:id/assignment", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
    const assignedUser = typeof req.body?.assignedUser === "string" ? req.body.assignedUser.trim() : "";
    if (!assignedUser) return sendError(res, 400, "An assignee is required.");
    if (TaskModel.db.readyState === 1) {
      const updated = await TaskModel.findByIdAndUpdate(getId(req), { assignedUser }, { new: true, runValidators: true }).lean();
      return updated ? res.json({ success: true, message: "Task assignment updated successfully.", data: serializeDocument(updated as unknown as Record<string, unknown>) }) : sendError(res, 404, "Task not found.");
    }
    const index = memoryTasks.findIndex(task => task.id === getId(req));
    if (index < 0) return sendError(res, 404, "Task not found.");
    memoryTasks[index] = { ...memoryTasks[index], assignedUser };
    return res.json({ success: true, message: "Task assignment updated successfully.", data: memoryTasks[index] });
  });
}
