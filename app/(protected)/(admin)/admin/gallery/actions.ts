"use server";

import { prisma } from "@/lib/db/prisma-helper";

export async function createGallery(data: {
  memberName: string;
  title?: string;
  images: string[];
}) {
  return await prisma.gallery.create({ data });
}

export async function getGalleries() {
  return await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteGallery(id: string) {
  return await prisma.gallery.delete({
    where: { id },
  });
}

export async function updateGallery(data: {
  id: string;
  memberName: string;
  title?: string;
  images: string[];
}) {
  return await prisma.gallery.update({
    where: { id: data.id },
    data: {
      memberName: data.memberName,
      title: data.title,
      images: data.images,
    },
  });
}