"use client";

import { useState } from "react";
import { forgotPasword, validateUser } from "@/lib/actions/user-action";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await validateUser(identifier);

    if (!result.success) {
      setMessage("User with this email or username cannot be found.");
      return;
    }

    const res = await forgotPasword(result.data);

    if (!res.success) {
      setMessage(res.message);
      return;
    }

    setMessage("");
    setDialogOpen(true);
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full flex bg-emerald-50",
        className
      )}
      {...props}
    >

      <div className="hidden lg:flex w-[35%] flex-col justify-center bg-emerald-700 text-white p-14">

        <div className="max-w-sm space-y-6">

          <h1 className="text-4xl font-bold leading-tight">
            Family Tree Manager
          </h1>

          <p className="text-emerald-100 text-lg">
            Securely recover access to your family tree and continue preserving your family's history.
          </p>

          <div className="space-y-3 text-sm text-emerald-200 pt-2">

            <p> Restore access to your account</p>
            <p> Continue managing your family tree</p>
            <p> Keep your family history secure</p>
            <p> Safe password recovery</p>

          </div>

        </div>

      </div>

      <div className="w-full lg:w-[65%] flex items-center justify-center px-8 py-12">

        <div className="w-full max-w-md">

          <Card className="shadow-xl border border-emerald-200">

            <CardHeader className="space-y-2 text-center">

              <CardTitle className="text-2xl font-semibold text-gray-800">
                Forgot Password
              </CardTitle>

              <CardDescription>
                Enter your email or username to reset your password
              </CardDescription>

            </CardHeader>

            <CardContent>

              <form onSubmit={handleSubmit} className="space-y-5">

                <FieldGroup>

                  <Field>

                    <FieldLabel htmlFor="email">
                      Email or Username
                    </FieldLabel>

                    <Input
                      id="email"
                      type="text"
                      placeholder="m@example.com or username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="h-11"
                    />

                  </Field>

                  {message && (
                    <p className="text-sm text-red-500">
                      {message}
                    </p>
                  )}

                  <Field className="pt-2">

                    <Button
                      type="submit"
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Send Reset Link
                    </Button>

                  </Field>

                </FieldGroup>

              </form>

            </CardContent>

          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © {new Date().getFullYear()} Family Tree Manager
          </p>

        </div>

      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm border border-emerald-200 shadow-lg">

          <DialogHeader className="items-center text-center space-y-3">

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <DialogTitle className="text-xl font-semibold text-gray-800">
              Request Sent
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
              A password reset link has been sent to your registered email address.
            </DialogDescription>

          </DialogHeader>

          <DialogFooter className="mt-4">

            <Button
              onClick={() => setDialogOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Close
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}