import { prisma } from "@/lib/db/prisma-helper";
import { Role, Status } from "@/lib/generated/prisma/enums";

async function main() {
    await prisma.user.create({
        data: {
            username: "admin",
            firstName: "Admin",
            lastName: "User",
            email: "admin@example.com",
            avatar: "",
            password: "admin123",
            status: Status.ACTIVE,
            role: Role.ADMIN,
        },
    });

    await prisma.user.create({
        data: {
            username: "user",
            firstName: "User",
            lastName: "User",
            email: "user@example.com",
            avatar: "",
            password: "user123",
            status: Status.ACTIVE,
            role: Role.USER,
        },
    });

    console.log("Seed data inserted 🌱");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });