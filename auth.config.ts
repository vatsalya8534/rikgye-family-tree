import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    providers: [],
    callbacks: {
        authorized({ request, auth }) {

            // array of regex patterns of path we want to protect
            const protectedPaths = [
                /\/admin/,
                /\/user/,
            ]

            // Get pathname from the req URL object
            const { pathname } = request.nextUrl;
            // Check if user is not authenticated and accessing a protected path
            if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

            return true;
        }
    }
} satisfies NextAuthConfig;
