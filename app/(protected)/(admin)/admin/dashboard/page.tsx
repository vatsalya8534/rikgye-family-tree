import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma-helper";
import Chart from "@/components/dashboard/chart";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;

  const range = params?.range || "7d";

  const days = range === "30d" ? 30 : 7;
  const date = new Date();
  date.setDate(date.getDate() - days);

  // TOTAL COUNTS
  const [users, members, families] = await Promise.all([
    prisma.user.count(),
    prisma.member.count(),
    prisma.familyMember.count(),
  ]);

  // GROWTH
  const [newUsers, newMembers, newFamilies] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: date } } }),
    prisma.member.count({ where: { createdAt: { gte: date } } }),
    prisma.familyMember.count({ where: { createdAt: { gte: date } } }),
  ]);

  // RECENT USERS
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
        <CardContent className="py-6">
          <h1 className="text-3xl font-bold">
            Welcome back, Admin 👋
          </h1>
          <p className="text-sm opacity-90">
            Here’s what’s happening in your system today.
          </p>
        </CardContent>
      </Card>

      

      {/* STATS */}
      <section className="grid md:grid-cols-3 gap-4">
        <Stat title="Total Users" value={users} growth={newUsers} />
        <Stat title="Total Members" value={members} growth={newMembers} />
        <Stat title="Total Families" value={families} growth={newFamilies} />
      </section>

      {/* CHARTS */}
      <section className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Users Growth">
          <Chart type="users" range={range} />
        </ChartCard>

        <ChartCard title="Members Growth">
          <Chart type="members" range={range} showStats />
        </ChartCard>
      </section>

      {/* RECENT USERS */}
      <section>
        <Card className="shadow-md">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Recent Users</h2>

            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No users found
              </p>
            ) : (
              <ul className="space-y-2">
                {recentUsers.map((user) => (
                  <li key={user.id} className="flex justify-between text-sm">
                    <span>{user.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

    </div>
  );
}

// ================= STAT CARD =================
function Stat({ title, value, growth }: any) {
  const isPositive = growth >= 0;
  const percentage = value === 0 ? 0 : Math.round((growth / value) * 100);

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-muted-foreground">{title}</p>

      <div className="flex justify-between items-center mt-1">
        <h2 className="text-2xl font-bold">{value}</h2>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(percentage)}%
        </span>
      </div>

      <p className={`text-sm mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "+" : ""}
        {growth} this period
      </p>
    </Card>
  );
}

// ================= CHART CARD =================
function ChartCard({ title, children }: any) {
  return (
    <Card className="p-4 shadow-sm">
      <p className="font-semibold mb-2">{title}</p>
      <div className="h-[300px]">{children}</div>
    </Card>
  );
}