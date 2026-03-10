import { ResetPasswordForm } from "../reset-password-form";

export default async function ResetPasswordPage({ params }: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params;

    console.log(id);
    

    return (
        <div>
            <div className="flex min-h-svh w-full items-center justify-center">
                <div className="w-full max-w-sm">
                    <ResetPasswordForm userId={id} />
                </div>
            </div>
        </div>
    )
}