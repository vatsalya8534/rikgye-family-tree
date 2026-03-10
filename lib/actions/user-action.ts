"use server";

import { z } from "zod";
import { User } from "@/types";
import { prisma } from "../db/prisma-helper";
import { loginFormSchema, userSchema } from "../validators";
import { formatError } from "../utils";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { Role } from "../generated/prisma/enums";
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
      const user = userSchema.parse(data)

      const imageValue = user.avatar instanceof File ? user.avatar.name : user.avatar ?? null

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
         }
      })

      return {
         success: true,
         message: "User created successfully"
      }

   } catch (error) {
      return {
         success: false,
         message: formatError(error)
      }
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
      await sendMail({
         to: user.email as string,
         subject: "Forgot Password",
         html: `
         Please click the link to reset the password
         <a href="${process.env.NEXT_APP_SERVER_URL + "/reset-password/" + user.id}">reset password</a>
        `,
      });

      return {
         success: true,
         message: "Please check your inbox"
      }
   } catch (error) {
      return {
         success: false,
         message: "Something went wrong"
      }
   }
}

export async function updatePassword(userId: string, password: string) {
   try {

      let user = await getUserById(userId)

      if (user.success) {
         const hashedPassword = await bcrypt.hash(password, 10)

         await prisma.user.update({
            where: {
               id: userId
            },
            data: {
               password: password
            }
         })

         await sendMail({
            to: user?.data?.email as string,
            subject: "Reset Password",
            html: `
        Password has been reset`,
         });

         return { success: true }
      } else {
         return {
            success: false,
            message: "user not found"
         }
      }


   } catch (error: any) {
      return {
         success: false,
         message: error.message
      }
   }


}





