import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UserMenu from "@/components/user/user-menu";
import { Role } from "@/lib/generated/prisma/enums";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (session.user.role !== Role.ADMIN) {
        notFound()
    }

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="flex flex-col h-screen">

                {/* ✅ FIXED HEADER */}
                <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b bg-background">
                    <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 my-2">
                        <SidebarTrigger className="-ml-1" />

                        <Separator
                            orientation="vertical"
                            className="mx-2 data-[orientation=vertical]:h-4"
                        />

                        <div className="ml-auto flex items-center">
                            <UserMenu />
                        </div>
                    </div>
                </header>

                {/* ✅ ONLY THIS SCROLLS */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-green-50 to-emerald-100">
                    {children}
                </div>

            </SidebarInset>
        </SidebarProvider>
    );
}
