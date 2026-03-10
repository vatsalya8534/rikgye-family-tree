import { prisma } from "@/lib/db/prisma-helper";
import { NextResponse } from "next/server";

 
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error: unknown) {
    console.error("GET templates error:", error);

    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

 
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name: body.name,
        description: body.description ?? "",
      },
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error: unknown) {
    console.error("POST template error:", error);

    let message = "Failed to create template";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}