import z from "zod";
import { Gender, Role, Status } from "./generated/prisma/enums";

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


export const updateUserSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, "username is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.email().min(1, "User email is required"),
  avatar: z.union([
    z.instanceof(File),
    z.string()
  ]).optional(),
  password: z.string().min(1, "User password is required"),
   role: z.enum(Object.values(Role)),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

// sign-in schema
export const loginFormSchema = z.object({
  username: z.string("Invalid Username"),
  password: z.string().min(6, "Password should be at least 6 characters long")
})

export const cmsSchema = z.object({
  id: z.string().optional(),
  pageTitle: z.string().min(1, "Page Title is required"),
  pageIcon: z.union([
    z.instanceof(File),
    z.string().min(1)
  ]),
  pageContent: z.string().min(1, "Page Content is required"),
  status: z.enum(Object.values(Status)).default(Status.INACTIVE),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),

    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


export const familyMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().min(1, "Image is required"),
  gender: z.enum(Object.values(Gender)),
  birthDate: z.string().min(1, "Date of Birth is required"),
  birthPlace: z.string().min(1, "Place of Birth is requird"),
  isAlive: z.boolean(),
  currentResidence: z.string().min(1, "Current Residence is required"),
  deathDate: z.string().optional(),
  deathPlace: z.string().optional(),
  causeOfDeath: z.string().optional(),
  marriageDate: z.string().optional(),
  marriagePlace: z.string().optional(),
  spouseMaidenName: z.string().optional(),
  spouseFather: z.string().optional(),
  spouseMother: z.string().optional(),
  profession: z.string().optional(),
  email: z.string().min(1, "Invalid email").optional(),
  phone: z.string().optional(),
  parentId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
   relation: z.string().optional(),
});
