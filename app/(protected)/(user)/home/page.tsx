// import { FamilyTreeContent } from "@/components/family-tree/family-tree-content";
// import { FamilyProvider } from "@/context/FamilyContext";

// export default function FamilyPage() {
//   return (
//     <FamilyProvider>
//       <div className="min-h-screen flex flex-col">
//         {/* <FamilyControls /> */}
//         <FamilyTreeContent />
//       </div>
//     </FamilyProvider>
//   )
// }

import { auth } from '@/auth'
import FamilyTreeApp from '@/components/new-design/FamilyTreeApp'
import { buildFamilyTree, getTreeData } from '@/lib/actions/family-member'
import { getUserById } from '@/lib/actions/user-action'
import { prisma } from '@/lib/db/prisma-helper'
import { get } from 'http'

const NewDesign = async () => {
  const { data, members } = await getTreeData();

  let currentUser : any = await auth();

  currentUser = await getUserById(currentUser?.user?.id || "");

  return (
    <FamilyTreeApp data={data} members={members} currentUser={currentUser.data} />
  )
}

export default NewDesign