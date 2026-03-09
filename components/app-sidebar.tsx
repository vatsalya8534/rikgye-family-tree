"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  HomeIcon,
  LogOut,
  Map,
  PieChart,
  Settings2,
  Settings2Icon,
  SquareTerminal,
  TreesIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { IconDashboard, IconPageBreak, IconUser } from "@tabler/icons-react"
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible"
import { Logo } from "./ui/logo-collapse"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/admin/home",
      icon: HomeIcon,
      isActive: true,
    },
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
      isActive: true,
    },
     {
      title: "Users",
      url: "/admin/user",
      icon: IconUser,
      isActive: true,
    },
    {
      title: "Families",
      url: "/admin/familes",
      icon: TreesIcon,
      isActive: true,
    },

    {
      title: "Pages",
      url: "/admin/pages",
      icon: IconPageBreak,
      isActive: true,
    },
    {
      title: "General Settings",
      url: "/admin/settings",
      icon: Settings2Icon,
      isActive: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}


