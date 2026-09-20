import type { Express, Request, Response } from "express";
import { connectMongo, serializeDocument, StudentModel, TaskModel } from "./models";

type Student = { id: string; name: string; email: string; registrationDate: string };
type Task = { id: string; title: string; description: string; status: "todo" | "in-progress" | "completed"; assignedUser?: string; createdDate: string };

const memoryStudents: Student[] = [];
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

  app.post("/api/students", async (req, res) => {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length < 2) return sendError(res, 400, "Name must contain at least 2 characters.");
    if (!validEmail(email)) return sendError(res, 400, "A valid email address is required.");
    if (typeof password !== "string" || password.length < 8) return sendError(res, 400, "Password must contain at least 8 characters.");
    try {
      if (StudentModel.db.readyState === 1) {
        const created = await StudentModel.create({ name, email, password });
        return res.status(201).json({ success: true, message: "Student registered successfully.", data: serializeDocument(created.toObject() as unknown as Record<string, unknown>) });
      }
      if (memoryStudents.some(student => student.email === email.toLowerCase())) return sendError(res, 409, "A student with this email already exists.");
      const created = { id: `student-${Date.now()}`, name: name.trim(), email: email.toLowerCase(), registrationDate: new Date().toISOString() };
      memoryStudents.push(created);
      return res.status(201).json({ success: true, message: "Student registered successfully.", data: created });
    } catch (error) { return sendError(res, 400, error instanceof Error ? error.message : "Unable to register student."); }
  });

  app.get("/api/students", async (_req, res) => {
    if (StudentModel.db.readyState === 1) {
      const students = await StudentModel.find().sort({ registrationDate: -1 }).lean();
      return res.json({ success: true, data: students.map(student => serializeDocument(student as unknown as Record<string, unknown>)) });
    }
    return res.json({ success: true, data: memoryStudents });
  });

  app.put("/api/students/:id", async (req, res) => {
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

  app.delete("/api/students/:id", async (req, res) => {
    if (StudentModel.db.readyState === 1) {
      const deleted = await StudentModel.findByIdAndDelete(getId(req));
      return deleted ? res.json({ success: true, message: "Student deleted successfully." }) : sendError(res, 404, "Student not found.");
    }
    const index = memoryStudents.findIndex(student => student.id === getId(req));
    if (index < 0) return sendError(res, 404, "Student not found.");
    memoryStudents.splice(index, 1);
    return res.json({ success: true, message: "Student deleted successfully." });
  });

  app.post("/api/tasks", async (req, res) => {
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

  app.get("/api/tasks", async (_req, res) => {
    if (TaskModel.db.readyState === 1) {
      const tasks = await TaskModel.find().sort({ createdDate: -1 }).lean();
      return res.json({ success: true, data: tasks.map(task => serializeDocument(task as unknown as Record<string, unknown>)) });
    }
    return res.json({ success: true, data: memoryTasks });
  });

  app.put("/api/tasks/:id", async (req, res) => {
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

  app.delete("/api/tasks/:id", async (req, res) => {
    if (TaskModel.db.readyState === 1) {
      const deleted = await TaskModel.findByIdAndDelete(getId(req));
      return deleted ? res.json({ success: true, message: "Task deleted successfully." }) : sendError(res, 404, "Task not found.");
    }
    const index = memoryTasks.findIndex(task => task.id === getId(req));
    if (index < 0) return sendError(res, 404, "Task not found.");
    memoryTasks.splice(index, 1);
    return res.json({ success: true, message: "Task deleted successfully." });
  });
}
