"use client";

import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logoutUser } from '@/lib/actions/user-action';
import Image from 'next/image';
import defaultImage from "@/assets/images/no_profile_pic.jpg";
import Link from 'next/link';

const UserMenu = ({ user }: { user: any }) => {
    console.log(user);
    console.log(defaultImage);
    let image = defaultImage;

    if(user.image) {
        image = user.image;
    }
    
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Image src={image} height={30} width={30} alt={user.name} className="rounded-full border-2 border-primary" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-red-500" onClick={() => logoutUser()}>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserMenu