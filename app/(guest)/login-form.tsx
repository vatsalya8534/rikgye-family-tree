"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Field,FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useActionState, useEffect, useState } from "react";
import { loginFormUser } from "@/lib/actions/user-action"
export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    let [data, action] = useActionState(loginFormUser, {
        success: false,
        message: ''
    })

    const [mounted, setMounted] = useState<Boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (mounted) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Login</CardTitle>
                        <CardDescription>{data && !data.success && <p className="text-center text-destructive my-2">{data.message}</p>}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={action}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="username">UserName</FieldLabel>
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <a
                                            href="/forgot-password"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" name="password"  type="password" required />
                                </Field>
                                <Field>
                                    <Button type="submit">Login</Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }
}