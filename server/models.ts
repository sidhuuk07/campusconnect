import mongoose, { Schema, type Document, type Model } from "mongoose";

export type StudentDocument = Document & {
  name: string;
  email: string;
  password: string;
  registrationDate: Date;
};

export type TaskDocument = Document & {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  assignedUser?: string;
  createdDate: Date;
};

const studentSchema = new Schema<StudentDocument>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  // Lab starter only: replace with a password hash before production use.
  password: { type: String, required: true, minlength: 8, select: false },
  registrationDate: { type: Date, default: Date.now },
});

const taskSchema = new Schema<TaskDocument>({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  status: { type: String, enum: ["todo", "in-progress", "completed"], default: "todo" },
  assignedUser: { type: String, trim: true, maxlength: 120 },
  createdDate: { type: Date, default: Date.now },
});

export const StudentModel: Model<StudentDocument> = mongoose.models.Student || mongoose.model<StudentDocument>("Student", studentSchema);
export const TaskModel: Model<TaskDocument> = mongoose.models.Task || mongoose.model<TaskDocument>("Task", taskSchema);

let connectionPromise: Promise<typeof mongoose> | null = null;
export async function connectMongo() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoose.connection.readyState === 1) return mongoose;
  connectionPromise ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    console.warn("[MongoDB] Connection unavailable; using in-memory REST fallback.", error instanceof Error ? error.message : error);
    return null;
  }
}

export function serializeDocument(value: Record<string, unknown>) {
  const { _id, __v, password, ...rest } = value;
  return { id: String(_id), ...rest };
}
