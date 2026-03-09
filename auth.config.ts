import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [],
    callbacks: {
        authorized({ request, auth }) {
            const { pathname } = request.nextUrl;

            // not logged in
            if (!auth) {
                if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
                    return false;
                }
            }

            // admin route protection
            if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
                return false;
            }

            return true;
        },
    },
} satisfies NextAuthConfig;