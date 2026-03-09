import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/db/prisma-helper"

 
export const runtime = "nodejs"

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const name = formData.get("name") as string
    const role = formData.get("role") as string
    const bio = formData.get("bio") as string
    const file = formData.get("image") as File | null

    if (!name || !role || !bio) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "Image required" },
        { status: 400 }
      )
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG and JPEG allowed" },
        { status: 400 }
      )
    }

  
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

 
    const uploadDir = path.join(process.cwd(), "public/uploads")

    const filename = uuidv4() + path.extname(file.name)
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/${filename}`

    const newMember = await prisma.member.create({
      data: {
        name,
        role,
        bio,
        image: imageUrl,
      },
    })

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}