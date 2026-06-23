import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { UserModel } from "./models/user";
import { AppError } from "./errors";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await UserModel.findById(decoded.userId);
  if (!user) {
    throw new AppError("User not found", 401);
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}
