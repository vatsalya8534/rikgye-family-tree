import { auth } from "@/auth"
import { Role } from "@/lib/generated/prisma/enums"
import { redirect } from "next/navigation"

export default async function Redirect() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    if (session.user.role === Role.ADMIN) {
        redirect("/admin/home")
    }

    if (session.user.role === Role.USER) {
        redirect("/home")
    }

    redirect("/")
}