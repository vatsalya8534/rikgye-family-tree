import { prisma } from "@/lib/db/prisma-helper";
import { NextResponse } from "next/server";
 
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    console.log("Updating template id:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? "",
      },
    });

    return NextResponse.json(template);

  } catch (error: unknown) {
    console.error("UPDATE TEMPLATE ERROR:", error);

    let message = "Failed to update template";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
 
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Deleting template id:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TEMPLATE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}