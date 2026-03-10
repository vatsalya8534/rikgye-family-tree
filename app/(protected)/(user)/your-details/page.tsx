import YourDetails from "@/components/user/your-details";
import { getCurrentUser } from "@/lib/actions/user-action";
import { User } from "@/types";

export default async function Page() {
  const user = await getCurrentUser();

  if (user?.data) {
    return (
      <div className="p-6">
        <YourDetails user={user.data as User} />
      </div>
    );
  }
}