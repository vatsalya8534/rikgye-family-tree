import z from "zod";
import { Role, Status } from "./generated/prisma/enums";

// user schema
export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, "username is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email().min(1, "User email is required"),
  avatar: z.union([
    z.instanceof(File),
    z.string().min(1)
  ]),
  password: z.string().min(1, "User password is required"),
  status: z.enum(Object.values(Status)),
  role: z.enum(Object.values(Role)),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

// sign-in schema
export const loginFormSchema = z.object({
    username: z.string("Invalid Username"),
    password: z.string().min(6, "Password should be at least 6 characters long")
})