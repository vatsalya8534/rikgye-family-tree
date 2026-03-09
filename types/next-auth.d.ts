import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    avatar?: string
    firstName?: string
  }

  interface Session {
    user: {
      id: string
      role: string
      avatar?: string
      firstName?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    name?: string
    email?: string
  }
}