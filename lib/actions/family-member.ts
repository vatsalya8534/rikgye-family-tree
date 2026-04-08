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

type FamilyNode = {
  id: string;
  name: string;
  gender?: string;
  birthYear?: number;
  spouses: {
    id: string;
    name: string;
    gender?: string;
    type?: string;
    birthYear?: number;
  }[];
  children: FamilyNode[];
};

export async function createFamilyMember(data: Omit<any, "id">) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.data?.id) {
    throw new Error("User not authenticated");
  }

  const countMembers = await prisma.familyMember.count();

  // If no members exist, force the first one to be root
  if (countMembers === 0) {
    data.type = "root";
  }

  const parentId = data.parentId ?? null;
  const relation = data.relation || "CHILD";

  return await prisma.$transaction(async (tx) => {
    const existingMember = parentId
      ? await tx.familyMember.findUnique({
        where: { id: parentId },
      })
      : null;

    let parentToAssign: string | null = null;

    // If adding a parent, assign the existing member's parent to the new member
    if (existingMember && ["FATHER", "MOTHER"].includes(relation)) {
      parentToAssign = existingMember.parentId ?? null;
    } else if (relation !== "FATHER" && relation !== "MOTHER") {
      // For CHILD or SPOUSE, use the provided parentId
      parentToAssign = parentId;
    }

    const member = await tx.familyMember.create({
      data: {
        name: data.name,
        image: Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []),
        gender: data.gender ?? "OTHER",
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        birthPlace: data.birthPlace || null,
        isAlive: data.isAlive ?? true,
        currentResidence: data.currentResidence || null,
        deathDate: data.deathDate ? new Date(data.deathDate) : null,
        deathPlace: data.deathPlace || null,
        causeOfDeath: data.causeOfDeath || null,
        marriageDate: data.marriageDate ? new Date(data.marriageDate) : null,
        marriagePlace: data.marriagePlace || null,
        spouseMaidenName: data.spouseMaidenName || null,
        spouseFather: data.spouseFather || null,
        spouseMother: data.spouseMother || null,
        profession: data.profession || null,
        email: data.email || null,
        phone: data.phone || null,
        relation: data.relation || null,
        type: data.type ?? "",

        parent: parentToAssign
          ? { connect: { id: parentToAssign } }
          : undefined,

        user: {
          connect: { id: currentUser.data.id },
        },
      },
    });

    // Update spouse relationship if provided
    if (data.spouseId) {
      await tx.familyMember.update({
        where: { id: member.id },
        data: {
          spouse: {
            connect: { id: data.spouseId },
          },
        },
      });
    }

    // Relink child to new parent
    if (["FATHER", "MOTHER"].includes(relation) && parentId) {
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
    where: {
      spouseId: null,
    },
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

export async function getTreeData() {
  let data: any = null;
  let rootMemberId = await prisma.familyMember.findFirst({
    where: { type: "root" },
  });

  if (rootMemberId !== null) {
    let result: any = await buildFamilyTree(rootMemberId.id);
    data = result;
  }

  const members = await prisma.familyMember.findMany();

  return {
    data,
    members,
  };
}

export async function getSpouses(spouseId: string) {
  const members = await prisma.familyMember.findMany({
    orderBy: { updatedAt: "desc" },
    where: {
      spouseId: spouseId
    }
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

  return formattedMembers;
}

export async function updateFamilyMember(data: any) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.familyMember.findUnique({
      where: { id: data.id },
      select: { spouseId: true },
    });

    const oldSpouseId = existing?.spouseId ?? null;
    const newSpouseId = data.spouseId ?? null;

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
        relation: data.relation,
        type: data.type ?? "",

        parent: data.parentId
          ? { connect: { id: data.parentId } }
          : { disconnect: true },

        spouse: newSpouseId
          ? { connect: { id: newSpouseId } }
          : { disconnect: true },
      },
    });

    // 🔥 remove old spouse link
    if (oldSpouseId && oldSpouseId !== newSpouseId) {
      await tx.familyMember.update({
        where: { id: oldSpouseId },
        data: {
          spouse: { disconnect: true },
        },
      });
    }

    // 🔥 set reverse spouse link
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

export async function getFamilyMemberByID(id: string) {
  return await prisma.familyMember.findFirst({
    where: {
      id: id
    }
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


function getBirthYear(date?: Date | null) {
  return date ? new Date(date).getFullYear() : undefined;
}

export async function buildFamilyTree(memberId: string): Promise<FamilyNode | null> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: {
      spouse: true,
      partner: true,
      children: {
        include: {
          spouse: true,
          partner: true,
          children: true,
        },
      },
    },
  });

  if (!member) return null;

  async function mapMember(m: any): Promise<FamilyNode> {
    // Fetch children recursively
    const children = await prisma.familyMember.findMany({
      where: { parentId: m.id },
      include: {
        spouse: true,
        partner: true,
      },
    });

    // 🧑‍🤝‍🧑 Spouses handling
    const spousesMap = new Map();

    if (m.spouse) {
      spousesMap.set(m.spouse.id, {
        id: m.spouse.id,
        name: m.spouse.name,
        gender: m.spouse.gender,
        type: "current",
        birthYear: getBirthYear(m.spouse.birthDate),
      });
    }

    // Include partner[] (ex/current)
    if (m.partner?.length) {
      for (const p of m.partner) {
        spousesMap.set(p.id, {
          id: p.id,
          name: p.name,
          gender: p.gender,
          type: p.type || "ex",
          birthYear: getBirthYear(p.birthDate),
        });
      }
    }

    return {
      id: m.id,
      name: m.name,
      gender: m.gender || undefined,
      birthYear: getBirthYear(m.birthDate),
      spouses: Array.from(spousesMap.values()),
      children: await Promise.all(children.map(mapMember)),
    };
  }

  return mapMember(member);
}