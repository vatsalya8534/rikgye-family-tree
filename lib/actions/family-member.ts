"use server";

import { prisma } from "@/lib/db/prisma-helper";
import { FamilyMember } from "@/types";
import { getCurrentUser } from "./user-action";

export interface FamilyMemberTree {
  id: string;
  name: string;
  image: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate?: string;
  birthPlace?: string;
  isAlive: boolean;
  currentResidence?: string;
  deathDate?: string;
  deathPlace?: string;
  causeOfDeath?: string;
  marriageDate?: string;
  marriagePlace?: string;
  spouseMaidenName?: string;
  spouseFather?: string;
  spouseMother?: string;
  profession?: string;
  email?: string;
  phone?: string;
  parentId: string | null;
  spouseId: string | null;
  userId: string;
  children: FamilyMemberTree[];
}

export async function createFamilyMember(data: Omit<any, "id">) {
  const currentUser = await getCurrentUser();

  console.log(data);
  

  if (!currentUser?.data?.id) {
    throw new Error("User not authenticated");
  }

  const parentId = data.parentId ?? null;

  return await prisma.$transaction(async (tx) => {
    const existingMember = parentId
      ? await tx.familyMember.findUnique({
          where: { id: parentId },
        })
      : null;

    let parentToAssign: string | null = null;

    if (data.relation === "FATHER") {
      parentToAssign = existingMember?.parentId ?? null;
    } else {
      parentToAssign = parentId;
    }

    const member = await tx.familyMember.create({
      data: {
        name: data.name,
        image: data.image,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        birthPlace: data.birthPlace,
        isAlive: data.isAlive,
        currentResidence: data.currentResidence,
        deathDate: data.deathDate ? new Date(data.deathDate) : null,
        deathPlace: data.deathPlace,
        causeOfDeath: data.causeOfDeath,
        marriageDate: data.marriageDate ? new Date(data.marriageDate) : null,
        marriagePlace: data.marriagePlace,
        spouseMaidenName: data.spouseMaidenName,
        spouseFather: data.spouseFather,
        spouseMother: data.spouseMother,
        profession: data.profession,
        email: data.email,
        phone: data.phone,

        parent: parentToAssign
          ? { connect: { id: parentToAssign } }
          : undefined,

        user: {
          connect: { id: currentUser.data.id },
        },
      },
    });

    if (data.spouseId) {
      // update current member
      await tx.familyMember.update({
        where: { id: member.id },
        data: {
          spouse: {
            connect: { id: data.spouseId },
          },
        },
      });

      // update spouse (reverse link)
      await tx.familyMember.update({
        where: { id: data.spouseId },
        data: {
          spouse: {
            connect: { id: member.id },
          },
        },
      });
    }

    // ✅ Relink child → new father
    if (data.relation === "FATHER" && parentId) {
      await tx.familyMember.update({
        where: { id: parentId },
        data: {
          parent: {
            connect: { id: member.id },
          },
        },
      });
    }

    return member;
  });
}

export async function getFamilyMembers(): Promise<FamilyMemberTree[]> {
  const members = await prisma.familyMember.findMany({
    orderBy: { birthDate: "asc" },
  });

  const formattedMembers = members.map((m) => ({
    id: m.id,
    name: m.name,
    image: m.image || "",
    gender: (m.gender as "MALE" | "FEMALE" | "OTHER") ?? "OTHER",
    birthDate: m.birthDate?.toISOString().split("T")[0] || undefined,
    birthPlace: m.birthPlace || undefined,
    isAlive: m.isAlive ?? true,
    currentResidence: m.currentResidence || undefined,
    deathDate: m.deathDate?.toISOString().split("T")[0] || undefined,
    deathPlace: m.deathPlace || undefined,
    causeOfDeath: m.causeOfDeath || undefined,
    marriageDate: m.marriageDate?.toISOString().split("T")[0] || undefined,
    marriagePlace: m.marriagePlace || undefined,
    spouseMaidenName: m.spouseMaidenName || undefined,
    spouseFather: m.spouseFather || undefined,
    spouseMother: m.spouseMother || undefined,
    profession: m.profession || undefined,
    email: m.email || undefined,
    phone: m.phone || undefined,
    parentId: m.parentId || null,
    userId: m.userId,
    children: [] as FamilyMemberTree[],
  }));

  const map = new Map<string, FamilyMemberTree>();
  const roots: any = [];

  formattedMembers.forEach((m: any) => map.set(m.id, m));

  formattedMembers.forEach((m) => {
    if (m.parentId) {
      const parent: any = map.get(m.parentId);
      if (parent) parent.children.push(m);
    } else {
      roots.push(m);
    }
  });

  return roots;
}


export async function updateFamilyMember(data: any) {
  return await prisma.$transaction(async (tx) => {
    // 🔍 get existing member
    const existing = await tx.familyMember.findUnique({
      where: { id: data.id },
      select: { spouseId: true },
    });

    const oldSpouseId = existing?.spouseId ?? null;
    const newSpouseId = data.spouseId ?? null;

    // ✅ 1. update main member
    const updated = await tx.familyMember.update({
      where: { id: data.id },
      data: {
        name: data.name,
        image: data.image,
        gender: data.gender,

        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        birthPlace: data.birthPlace,

        isAlive: data.isAlive,
        currentResidence: data.currentResidence,

        deathDate: data.deathDate ? new Date(data.deathDate) : null,
        deathPlace: data.deathPlace,
        causeOfDeath: data.causeOfDeath,

        marriageDate: data.marriageDate
          ? new Date(data.marriageDate)
          : null,
        marriagePlace: data.marriagePlace,

        spouseFather: data.spouseFather,
        spouseMother: data.spouseMother,
        spouseMaidenName: data.spouseMaidenName,

        profession: data.profession,
        email: data.email,
        phone: data.phone,

        parentId: data.parentId,

        // ✅ update spouse relation
        spouse: newSpouseId
          ? { connect: { id: newSpouseId } }
          : { disconnect: true },
      },
    });

    // 🔥 2. REMOVE old spouse link (if changed)
    if (oldSpouseId && oldSpouseId !== newSpouseId) {
      await tx.familyMember.update({
        where: { id: oldSpouseId },
        data: {
          spouse: { disconnect: true },
        },
      });
    }

    // 🔥 3. SET reverse link for new spouse
    if (newSpouseId && oldSpouseId !== newSpouseId) {
      await tx.familyMember.update({
        where: { id: newSpouseId },
        data: {
          spouse: {
            connect: { id: data.id },
          },
        },
      });
    }

    return updated;
  });
}

export async function deleteFamilyMember(id: string, deleteChildren: boolean) {
  if (deleteChildren) {
    await prisma.familyMember.deleteMany({
      where: {
        OR: [
          { id },
          { parentId: id }
        ]
      }
    });
  } else {
    await prisma.familyMember.updateMany({
      where: { parentId: id },
      data: { parentId: null }
    });

    await prisma.familyMember.delete({
      where: { id }
    });
  }
}