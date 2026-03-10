"use client";

import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Logo } from '@/components/ui/logo-collapse';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { IconDashboard, IconSitemap, IconUser } from '@tabler/icons-react';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link'
import React from 'react'

const items = [
    {
        title: "Home",
        url: "/home",
        icon: HomeIcon,
        isActive: true,
    },
    {
        title: "Known Rikhye",
        url: "/prominent",
        icon: IconDashboard,
        isActive: true,
    },
    {
        title: "Find Rikhye",
        url: "/findmemeber",
        icon: IconUser,
        isActive: true,
    },
    {
        title: "Your Details",
        url: "/your-details",
        icon: IconSitemap,
        isActive: true,
    }
]

const UserSideBar = () => {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={item.isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <Link href={item.url}>
                                        <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </CollapsibleTrigger>
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default UserSideBar