import { getCurrentUser } from "@/lib/actions/user-action";
import YourDetailsForm from "@/components/user/your-details"; 
import { User } from "@/types";

export default async function YourDetailsPage() {
  const user = await getCurrentUser();

  console.log(user?.data);

  

  if (!user) return <p className="text-center">No logged-in user found</p>;

  return <YourDetailsForm user={user.data as User} />; 
}