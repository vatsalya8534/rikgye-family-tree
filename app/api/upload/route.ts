import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
    const formData = await req.formData();

    const data = Object.fromEntries(formData.entries())    

    const file = formData.get("avatar") as File;

    console.log(file);
    

    if (!file) {
        return NextResponse.json({ message: "No image uploaded" }, { status: 400 });
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
        return NextResponse.json(
            { message: "Invalid file type" , success: false},
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads/images");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;

    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
        success: true,
        message: "Image uploaded successfully",
        url: `/uploads/images/${filename}`,
    });
}