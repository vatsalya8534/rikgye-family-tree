import { Role, Status } from "../generated/prisma/enums";

export const APP_NAME = process.env.NEXT_APP_APP_NAME ?? "Rikhye Family tree";
export const APP_DESCRIPTION = process.env.NEXT_APP_DESCRIPTION ?? "Rikhye Family tree";
export const SERVER_URL = process.env.NEXT_APP_SERVER_URL ?? "http://localhost:3000";

export const userDefaultValues = {
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    password: "",
    status: Status.ACTIVE,
    role: Role.USER,
};
