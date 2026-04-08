"use server";

import { z } from "zod";
import { User } from "@/types";
import { prisma } from "../db/prisma-helper";
import { loginFormSchema, userSchema } from "../validators";
import { formatError } from "../utils";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { sendMail } from "../mail";
import bcrypt from "bcrypt"


// get users
export async function getUsers() {
   return await prisma.user.findMany({
      orderBy: {
         createdAt: "desc",
      },
   })
}

// create user
export async function createUser(data: z.infer<typeof userSchema>) {
  try {
    const user = userSchema.parse(data);

    const imageValue =
      user.avatar instanceof File ? user.avatar.name : user.avatar ?? null;

    // ✅ CHECK USERNAME FIRST
    const existingUser = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Username already exists",
      };
    }

    await prisma.user.create({
      data: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: imageValue,
        password: user.password,
        status: user.status,
        role: user.role,
        level: user.level,
      },
    });

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// get user by id
export async function getUserById(id: string) {
   try {

      let user = await prisma.user.findFirst({
         where: { id }
      })

      if (user) {
         return {
            success: true,
            data: user,
            message: "User get successfully"
         }
      }

      return {
         success: false,
         message: "User not found"
      }

   } catch (error) {
      return {
         success: false,
         message: formatError(error)
      }
   }
}

// validate user
export async function validateUser(identifier: string) {
   try {
      const user = await prisma.user.findFirst({
         where: {
            OR: [
               { username: identifier },
               { email: identifier }
            ]
         }
      });

      if (!user) {
         return { success: false, message: "User not found" };
      }

      return { success: true, data: user };

   } catch (error) {
      return {
         success: false,
         message: formatError(error)
      };
   }
}

// update user
export async function updateUser(data: User, id: string) {
   try {

      const user = userSchema.parse(data)

      const imageValue = user.avatar instanceof File ? user.avatar.name : user.avatar ?? null

      let userData = await prisma.user.findFirst({
         where: { id }
      })

      if (!userData) {
         return {
            success: false,
            message: "User not found"
         }
      }

      await prisma.user.update({
         where: { id },
         data: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: imageValue ?? userData.avatar,
            password: user.password,
            status: user.status,
            role: user.role,
            level: user.level,
         }
      })

      return {
         success: true,
         message: "user updated successfully"
      }

   } catch (error) {
      return {
         success: false,
         message: formatError(error)
      }
   }
}

// delete user
export async function deleteUser(id: any) {
   try {
      await prisma.user.delete({
         where: { id }
      })

      return {
         success: true,
         message: "User deleted successfully"
      }

   } catch (error) {
      return {
         success: false,
         message: formatError(error)
      }
   }
}


// login 
export async function loginFormUser(prevState: unknown, formData: FormData) {

   try {
      const user = loginFormSchema.parse({
         username: formData.get("username"),
         password: formData.get("password")
      })

      const res = await signIn("credentials", {
         ...user,
         redirect: false,
      })
      if (res?.error) {
         return {
            success: false,
            message: "Invalid credentials",
         }
      }

      redirect("/redirect")

   } catch (error) {

      if (isRedirectError(error)) {
         throw error
      }

      return {
         success: false,
         message: "Invalid email and password"
      }
   }
}


export async function getCurrentUser() {
   try {
      const session = await auth();
      if (session?.user) {
         let userSession = session.user as User;

         return await getUserById(userSession.id as string)
      }
      return null;
   } catch (err) {
      console.error("Failed to get current user:", err);
      return null;
   }
}

// logout user
export async function logoutUser() {
   try {
      await signOut()
      return {
         success: true,
         message: "logout successfully"
      }
   } catch (error) {
      if (isRedirectError(error)) {
         throw error
      }

      return {
         success: false,
         message: "Something went wrong"
      }
   }
}


export async function forgotPasword(user: any) {
  try {
    const template = await prisma.template.findFirst({
      where: { name: "Forgot password" }, 
    });

    if (!template) {
      return {
        success: false,
        message: "Email template not found",
      };
    }

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${user.id}`;

    let emailHtml : any = template.description;

    emailHtml = emailHtml
      .replace(/\{\{name\}\}/g, user.name || "User")
      .replace(/\{\{reset_link\}\}/g, resetLink);

    await sendMail({
      to: user.email,
      subject: "Reset Your Password",
      html: emailHtml,
    });

    return {
      success: true,
      message: "Please check your inbox",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
export async function updatePassword(userId: string, password: string) {
  try {
    const user = await getUserById(userId);

    if (!user.success) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Prepare login link
    const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}`;

    // Get template from DB
    const template = await prisma.template.findFirst({
      where: { name: "Password Updated" },
    });

    if (!template) {
      console.warn("Email template not found");

      return {
        success: true,
        message: "Password updated (email not sent)",
      };
    }

    if (!user.data?.email) {
      return {
        success: true,
        message: "Password updated but email missing",
      };
    }

    let emailHtml : any = template.description;

    // Replace dynamic placeholders
    emailHtml = emailHtml
      .replace(/\{\{name\}\}/g, user.data?.firstName || "User")
      .replace(/\{\{login_link\}\}/g, loginLink);

    // Send email safely
    try {
      await sendMail({
        to: user.data.email,
        subject: "Password Updated",
        html: emailHtml,
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);

      return {
        success: true,
        message: "Password updated but email failed",
      };
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function updateProfile(user: any, id: string) {
   try {
      const imageValue = user.avatar instanceof File ? user.avatar.name : user.avatar ?? null

      await prisma.user.update({
         where: { id },
         data: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: imageValue ?? user.avatar,
         }
      })

      return { success: true }
   } catch (error: any) {
      return {
         success: false,
         message: error.message
      }
   }
}