import { prisma } from "@/lib/db/prisma-helper";
import { NextRequest, NextResponse } from "next/server";

// CREATE GALLERY
export async function POST(req: NextRequest) {
  try {
    const { memberName, title, images } = await req.json();

    if (!memberName || !images?.length) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.create({
      data: {
        memberName,
        title,
        images,
      },
    });

    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating gallery" },
      { status: 500 }
    );
  }
}

// GET ALL GALLERIES
export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(galleries);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching galleries" },
      { status: 500 }
    );
  }
}