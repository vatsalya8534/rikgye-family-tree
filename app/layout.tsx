import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { prisma } from "@/lib/db/prisma-helper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const setting = await prisma.settings.findFirst();

  // Leading slash + cache-busting
  const faviconPath = setting?.favicon
    && `/${setting.favicon.replace(/^\/?/, "")}?v=${Date.now()}`
    ;

  return {
    title: `${setting?.siteTitle || "Family Tree"} | Family Tree`,
    description: setting?.siteDescription || "Family Tree App",
    icons: {
      icon: faviconPath,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
