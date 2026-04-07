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

const emptyToUndefined = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.string().optional()
);

export const familyMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),

  // --- IMAGES ---
  image: z.array(
    z.union([
      z.instanceof(File),
      z.string().min(1)
    ])
  ).optional().default([]),

  // --- BASIC INFO ---
  gender: z.nativeEnum(Gender).optional(),
  birthDate: emptyToUndefined,
  birthPlace: emptyToUndefined,
  isAlive: z.boolean().default(true),
  currentResidence: emptyToUndefined,

  // --- DEATH INFO (Only relevant if isAlive is false) ---
  deathDate: emptyToUndefined,
  deathPlace: emptyToUndefined,
  causeOfDeath: emptyToUndefined,

  // --- MARRIAGE INFO ---
  marriageDate: emptyToUndefined,
  marriagePlace: emptyToUndefined,
  spouseMaidenName: emptyToUndefined,
  spouseFather: emptyToUndefined,
  spouseMother: emptyToUndefined,

  // --- CONTACT & PROFESSION ---
  profession: emptyToUndefined,
  // email: z.preprocess(
  //   (val) => (val === "" ? undefined : val),
  //   z.string().email("Invalid email format").optional()
  // ),
  email: emptyToUndefined,
  phone: emptyToUndefined,
  type: z.string().optional(),

  // --- RELATIONSHIPS ---
  parentId: z.string().nullable().optional(),
  spouseId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  relation: emptyToUndefined,
});