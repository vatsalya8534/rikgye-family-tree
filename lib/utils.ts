import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(error: any) {
  try {
    if (error.name === "ZodError") {
      const filterErrors = Object.keys(error.errors).map((field: any) => error.errors[field].message);

      return filterErrors.join(". ")
    } else if (error.name === "PrismaClientKnownRequestError" && error.code === "P2002") {
      const field = error.meta?.target ? error.meta.target[0] : "Field"
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    } else {
      return typeof error.message === "string" ? error.message : JSON.stringify(error.message)
    }

  } catch (error) {
    return "Something went wrong"
  }
}