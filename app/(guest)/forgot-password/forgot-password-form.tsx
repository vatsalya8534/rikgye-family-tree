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
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await validateUser(identifier);

    if (!result.success) {
      setMessage("user on email id cannot be found");
      return;
    }

    let res = await forgotPasword(result.data)

     if (!res.success) {
      setMessage(res.message);
      return;
    }
     
    setMessage("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Forgot Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
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
                />
              </Field>

              {message && (
                <p className="text-sm text-red-500">{message}</p>
              )}

              <Field>
                <Button type="submit">Submit</Button>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}