import { prisma } from "@/lib/db/prisma-helper";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SettingsBody = {
  siteTitle?: string;
  siteKeywords?: string;
  siteDescription?: string;
  siteUrl?: string;
  isSMTP?: boolean;
  host?: string;
  username?: string;
  password?: string;
  port?: number | null;
  auth?: boolean;
  encryption?: string;
};
 
export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

 
export async function POST(req: Request) {
  try {
    const body: SettingsBody = await req.json();

    const created = await prisma.settings.create({
      data: {
        isSMTP: false,
        ...body,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("CREATE SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create settings" },
      { status: 500 }
    );
  }
}
 
export async function PUT(req: Request) {
  try {
    const { id, ...body } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Valid string ID is required for update" },
        { status: 400 }
      );
    }
 
    const existing = await prisma.settings.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.settings.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
 
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Valid string ID is required for delete" },
        { status: 400 }
      );
    }

    const existing = await prisma.settings.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    await prisma.settings.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete settings" },
      { status: 500 }
    );
  }
}