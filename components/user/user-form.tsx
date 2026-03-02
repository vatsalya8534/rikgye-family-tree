"use client";

import { userSchema } from '@/lib/validators'
import { User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ArrowRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createUser, updateUser } from '@/lib/actions/user-action';
import { userDefaultValues } from '@/lib/contants';
import { Role, Status } from '@/lib/generated/prisma/enums';

type UserFormProps = {
    data?: User
    update?: boolean
}

const UserForm = ({ data, update = false }: UserFormProps) => {
    const [mounted, setMounted] = useState(false)

    const router = useRouter()
    const id = data?.id

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: data || userDefaultValues
    })

    const [isPending, startTransition] = React.useTransition()

    const onSubmit: SubmitHandler<z.infer<typeof userSchema>> = async (values: any) => {

        startTransition(async () => {
            let res;

            if (values.avatar instanceof File) {
                const formData = new FormData();
                formData.append("avatar", values.avatar);

                const fileUploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await fileUploadRes.json();

                values.avatar = data.url
            }

            if (update && id) {
                res = await updateUser(values, id)
            } else {
                res = await createUser(values)
            }

            if (!res?.success) {
                toast.error("Error", {
                    description: res?.message
                })
            } else {
                router.push("/admin/user")
            }
        })
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (mounted) {
        return (
            <Form {...form}>
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}>
                    <div className='grid grid-cols-2 gap-4'>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="firstName">First name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="firstName"
                                                placeholder="Enter First name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="lastName">First name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="lastName"
                                                placeholder="Enter Last Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="username"
                                                placeholder="Enter username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                placeholder="Enter email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="password"
                                                placeholder="Enter password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name='avatar'
                                render={({
                                    field
                                }) => (
                                    <FormItem>
                                        <FormLabel>Avatar</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                onChange={(e) => field.onChange(e.target.files?.[0])}
                                            />


                                        </FormControl>
                                        <FormMessage />
                                        {
                                            data?.avatar && <div className='mt-4'>
                                                <img src={data.avatar} alt="" height={100} width={100} />
                                            </div>
                                        }

                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name='role'
                                render={({
                                    field
                                }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={(v) => field.onChange(v as Role)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={Role.USER}>USER</SelectItem>
                                                    <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <div className='flex flex-col gap-5'>
                            <FormField
                                control={form.control}
                                name='status'
                                render={({
                                    field
                                }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={(v) => field.onChange(v as Status)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                                                    <SelectItem value={Status.INACTIVE}>Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <Button type='submit' className='cursor-pointer' disabled={isPending}>
                            {
                                isPending ? (<Loader className='w-4 h-4 animate-spin cursor-pointer' />) : (
                                    <ArrowRight className='w-4 h-4' />
                                )
                            }{" "} Save
                        </Button>
                    </div>
                </form>
            </Form>
        )
    }
}

export default UserForm