import { prisma } from "@/lib/db/prisma-helper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const range = searchParams.get("range") || "7d";

  const days = range === "30d" ? 30 : 7;


  let currentItems: any[] = [];
  let previousItems: any[] = [];

  // ================= MEMBERS =================
  if (type === "members") {


    currentItems = await prisma.member.findMany();

    previousItems = [];
  }

  // ================= USERS =================
  if (type === "users") {

   
    currentItems = await prisma.user.findMany();

    previousItems = [];
  }

  // ================= GROUP DATA =================
  const map: Record<string, number> = {};

  currentItems.forEach((item) => {
    const d = new Date(item.createdAt).toLocaleDateString();
    map[d] = (map[d] || 0) + 1;
  });

  const data =
    Object.keys(map).length === 0
      ? [{ date: "No Data", count: 0 }] 
      : Object.entries(map).map(([date, count]) => ({
          date,
          count,
        }));

  // ================= RESPONSE =================
  return Response.json({
    data,
    stats: {
      current: currentItems.length,
      previous: previousItems.length,
      diff: currentItems.length - previousItems.length,
    },
  });
}