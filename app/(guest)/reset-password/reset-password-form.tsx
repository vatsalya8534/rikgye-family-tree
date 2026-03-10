"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { passwordSchema } from "@/lib/validators"
import { updatePassword } from "@/lib/actions/user-action"
import { z } from "zod"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type FormData = z.infer<typeof passwordSchema>

export function ResetPasswordForm({
  className,
  userId,
  ...props
}: React.ComponentProps<"div"> & { userId: string }) {

  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
  })
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      await updatePassword(userId, data.newPassword)

      setDialogOpen(true)

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Reset Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>

              <Field>
                <FieldLabel htmlFor="newPassword">Password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.newPassword.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  Update Password
                </Button>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Password Updated</DialogTitle>
            <DialogDescription>
              Your password has been successfully updated.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => {
                setDialogOpen(false)
                router.push("/")
              }}
            >
              Go to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  )
}