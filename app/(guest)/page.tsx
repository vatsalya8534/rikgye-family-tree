import { LoginForm } from "./login-form"

export default function LoginPage() {
    return (
        <div>
            <div className="flex min-h-svh w-full items-center justify-center">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
