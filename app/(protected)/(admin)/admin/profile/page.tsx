// import YourDetails from "@/components/user/your-details";

// export default function Page() {
//   return (
//     <div className="p-6">
//       <YourDetails />
//     </div>
//   );
// }

// app/user/your-details/page.tsx
import { getCurrentUser } from "@/lib/actions/user-action";
import YourDetailsForm from "@/components/user/your-details"; 
import { User } from "@/types";

export default async function YourDetailsPage() {
  const user = await getCurrentUser();

  console.log(user?.data);

  

  if (!user) return <p className="text-center">No logged-in user found</p>;

  return <YourDetailsForm user={user.data as User} />; // pass user as prop
}