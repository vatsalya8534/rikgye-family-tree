"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deleteUser, getUsers } from '@/lib/actions/user-action';
import { User } from '@/types'
import { EditIcon, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner';

const UserTable = ({ data }: { data: User[] }) => {

  const [users, setUsers] = useState<User[]>(data)

  const deleteUserHandler = async (id: any) => {
    let res = await deleteUser(id);

    if (!res?.success) {
      toast.error("Error", {
        description: res?.message
      })
    } else {
      toast.success("Success", {
        description: res?.message
      })

      const response = await getUsers()
      setUsers(response as User[])
    }
  }

  return (
    <Table className='w-full'>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>CreatedAt</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>

            {/* Image column — intentionally blank */}
            <TableCell>
              {user.avatar &&  <img src={user.avatar} alt="" height="100" width="100" />}
            </TableCell>

            <TableCell>{user.firstName}</TableCell>
            <TableCell>{user.lastName}</TableCell>

            <TableCell>{user.email}</TableCell>

            <TableCell>
              {user.status === "ACTIVE" ? (
                <Badge className="bg-green-500">ACTIVE</Badge>
              ) : (
                <Badge variant="destructive">INACTIVE</Badge>
              )}
            </TableCell>

            <TableCell>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "-"}
            </TableCell>

            <TableCell>
              <div className="flex gap-2">
                <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600">
                  <Link href={`/admin/user/edit/${user.id}`}>
                    <EditIcon size={16} />
                  </Link>
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteUserHandler(user.id)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </TableCell>

          </TableRow>
        ))}
      </TableBody>

    </Table>
  )
}

export default UserTable