import { UserModel } from "../models/user";
import { generateToken } from "../jwt";
import { AppError } from "../errors";
import type { LoginInput, RegisterInput } from "../validators/auth";

export async function loginUser(input: LoginInput) {
  const user = await UserModel.findByEmail(input.email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await UserModel.comparePassword(user, input.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await UserModel.findByEmail(input.email);
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const user = await UserModel.create({
    email: input.email,
    password: input.password,
    name: input.name,
    role: "admin",
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    message: "User created successfully",
    token,
    user,
  };
}

export async function getMe(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { success: true, user };
}
