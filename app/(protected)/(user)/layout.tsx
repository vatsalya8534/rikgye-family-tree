import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar"

import Link from "next/link"
import { Role } from "@/lib/generated/prisma/browser"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import UserMenu from "@/components/user/user-menu"
import { Separator } from "@/components/ui/separator"
import { logoutUser } from "@/lib/actions/user-action"
import UserSideBar from "./user-sidebar"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  if (session.user.role !== Role.USER) {
    notFound()
  }

  return (
    <SidebarProvider>
      <UserSideBar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 my-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="ml-auto flex items-center">
              <UserMenu user={session.user} />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>

  )
}