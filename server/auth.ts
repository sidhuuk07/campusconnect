import type { NextFunction, Request, Response } from "express";
import { jwtVerify, SignJWT } from "jose";

export type AuthUser = { id: string; email: string; name: string; role: "student" | "faculty" | "admin" };
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "campusconnect-development-secret-change-me");

export async function createToken(user: AuthUser) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const result = await jwtVerify(token, secret);
  return { id: String(result.payload.sub), email: String(result.payload.email), name: String(result.payload.name), role: (result.payload.role as AuthUser["role"]) || "student" };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
  try {
    res.locals.user = await verifyToken(header.slice(7));
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session is invalid or expired. Please log in again." });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (_req: Request, res: Response, next: NextFunction) => roles.includes(res.locals.user?.role) ? next() : res.status(403).json({ success: false, message: "You do not have permission to access this resource." });
}
