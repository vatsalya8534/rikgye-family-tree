import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/db/prisma-helper"
import CredentialsProvider from "next-auth/providers/credentials"
import bycrpt from "bcrypt"

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/",
        error: "/"
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials: {
                username: { type: 'text' },
                password: { type: "password" }
            },
            async authorize(credentials) {
                if (credentials == null) return null;

                // find user in database
                const user = await prisma.user.findFirst({
                    where: { username: credentials.username as string, password: credentials.password as string }
                })

                console.log(await prisma.user.findMany());
                

                if (user) {
                    return {
                        id: user.id,
                        image: user.avatar,
                        name: user.firstName,
                        email: user.email,
                        role: user.role
                    }
                }

                // check if user exist and if the password matches
                // if (user && user.password) {
                //     // const isMatched = await bycrpt.compare(credentials.password as string, user.password)

                //     // if password  is correct , return user
                //     if (isMatched) {
                //         return {
                //             id: user.id,
                //             image: user.avatar,
                //             name: user.firstName,
                //             email: user.email,
                //             role: user.role
                //         }
                //     }
                // }

                // if user does not exist or password does not matched return null
                return null
            }
        })
    ],
    callbacks: {
        async session({ session, user, trigger, token }: any) {
            // set the user id from the token
            session.user.id = token.sub
            session.user.role = token.role
            session.user.name = token.name
            session.user.email = token.email

            // if there is an update , set the user name
            if (trigger === "update") {
                session.user.image = user.avatar
                session.user.name = user.firstName
            }

            return session
        },
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { firstName: token.name }
                })
            }

            return token
        }
    }
})