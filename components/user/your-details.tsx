// "use client";

// import { useState, useEffect } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Role } from "@/lib/generated/prisma/enums";
// import { auth } from "@/auth"; 
// import { User } from "@/types";
// import { updateUser } from "@/lib/actions/user-action";

// export default function YourDetails() {
//   const [user, setUser] = useState<User | null>(null);
//   const [image, setImage] = useState<string | undefined>();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         const session = await auth(); 
//         if (session?.user) {
//           setUser(session.user as User);
//           setImage(session.user.avatar || undefined);
//         }
//       } catch (err) {
//         console.error("Failed to get current user:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchUser();
//   }, []);

//   if (loading) return <p className="text-center">Loading...</p>;
//   if (!user) return <p className="text-center">No logged-in user found</p>;

//   const handleImage = (file: File | null) => {
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     setImage(url);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//   const formData = new FormData(e.currentTarget);

//   if (!user?.id) {
//     alert("User ID is missing");
//     return;
//   }

//   const avatarValue: string | File = image ?? user.avatar ?? "default-avatar.png";

//   const updatedUser = {
//     ...user,
//     username: formData.get("username") as string,
//     firstName: formData.get("firstName") as string,
//     lastName: formData.get("lastName") as string,
//     email: formData.get("email") as string,
//     avatar: avatarValue, 
//     password: (formData.get("password") as string) || user.password || "",
//     status: user.status,
//     role: user.role,
//   };

//   try {
//     const res = await updateUser(updatedUser, user.id);

//     if (res.success) {
//       setUser(updatedUser);
//       setDialogOpen(true);
//       e.currentTarget.reset();
//       setImage(undefined);
//     } else {
//       alert(res.message);
//     }
//   } catch (error) {
//     console.error("Failed to update user:", error);
//     alert("Something went wrong while updating your details.");
//   }
// };

//   return (
//     <div className="max-w-5xl mx-auto bg-white p-10 rounded-xl shadow-lg">
//       <h2 className="text-xl font-bold mb-6">Manage your details</h2>

//       <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
//         {/* Image */}
//         <div className="col-span-2">
//           <label className="block mb-2 font-medium">Profile Image</label>
//           {image && <img src={image} className="w-24 h-24 rounded-full mb-3 object-cover" />}
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => handleImage(e.target.files?.[0] || null)}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         {/* Username */}
//         <div>
//           <label className="block mb-2 font-medium">Username</label>
//           <input name="username" defaultValue={user.username} className="w-full border p-2 rounded" required />
//         </div>

//         {/* First Name */}
//         <div>
//           <label className="block mb-2 font-medium">First Name</label>
//           <input name="firstName" defaultValue={user.firstName} className="w-full border p-2 rounded" required />
//         </div>

//         {/* Last Name */}
//         <div>
//           <label className="block mb-2 font-medium">Last Name</label>
//           <input name="lastName" defaultValue={user.lastName} className="w-full border p-2 rounded" required />
//         </div>

//         {/* Role */}
//         <div>
//           <label className="block mb-2 font-medium">Role</label>
//           <Select name="role" defaultValue={user.role} disabled>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Role" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value={Role.USER}>USER</SelectItem>
//               <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block mb-2 font-medium">Email</label>
//           <input name="email" defaultValue={user.email} type="email" className="w-full border p-2 rounded" required />
//         </div>

//         {/* Password */}
//         <div>
//           <label className="block mb-2 font-medium">New Password</label>
//           <input name="password" type="password" className="w-full border p-2 rounded" />
//         </div>

//         <div className="col-span-2">
//           <button className="bg-black text-white px-4 py-2 rounded">Save Details</button>
//         </div>
//       </form>

//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-sm">
//           <DialogHeader>
//             <DialogTitle>Success</DialogTitle>
//           </DialogHeader>
//           <p>Details updated successfully!</p>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Role } from "@/lib/generated/prisma/enums";
import { User } from "@/types";
import { updateUser } from "@/lib/actions/user-action";

interface YourDetailsFormProps {
  user: User;
}

export default function YourDetailsForm({ user: initialUser }: YourDetailsFormProps) {
  // Ensure image is always string
  const [user, setUser] = useState<User>(initialUser);
  const [image, setImage] = useState<string>(initialUser.avatar || "default-avatar.png");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleImage = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url); // always a string
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Make sure avatar is a string
    const avatarValue: string = image ?? "default-avatar.png";

    const updatedUser: User = {
      ...user,
      username: formData.get("username") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      avatar: avatarValue,
      password: (formData.get("password") as string) || user.password || "",
      status: user.status,
      role: user.role,
    };

    try {
      const res = await updateUser(updatedUser, user.id);

      if (res.success) {
        setUser(updatedUser);
        setDialogOpen(true);
        e.currentTarget.reset();
        // setImage(updatedUser.avatar); // keep string
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Something went wrong while updating your details.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-6">Manage your details</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block mb-2 font-medium">Profile Image</label>
          {image && <img src={image} className="w-24 h-24 rounded-full mb-3 object-cover" />}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImage(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Username</label>
          <input name="username" defaultValue={user.username} className="w-full border p-2 rounded" required />
        </div>

        <div>
          <label className="block mb-2 font-medium">First Name</label>
          <input name="firstName" defaultValue={user.firstName} className="w-full border p-2 rounded" required />
        </div>

        <div>
          <label className="block mb-2 font-medium">Last Name</label>
          <input name="lastName" defaultValue={user.lastName} className="w-full border p-2 rounded" required />
        </div>

        <div>
          <label className="block mb-2 font-medium">Role</label>
          <Select name="role" defaultValue={user.role} disabled>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Role.USER}>USER</SelectItem>
              <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Email</label>
          <input name="email" defaultValue={user.email} type="email" className="w-full border p-2 rounded" required />
        </div>

        <div>
          <label className="block mb-2 font-medium">New Password</label>
          <input name="password" type="password" className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-2">
          <button className="bg-black text-white px-4 py-2 rounded">Save Details</button>
        </div>
      </form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
          </DialogHeader>
          <p>Details updated successfully!</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}