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

import FamilyTreeApp from '@/components/new-design/FamilyTreeApp'
import { buildFamilyTree } from '@/lib/actions/family-member'
import { prisma } from '@/lib/db/prisma-helper'

const NewDesign = async () => {
  let data: any = null
  let rootMemberId = await prisma.familyMember.findFirst({
    where: { parentId: null },
  });

  if (rootMemberId !== null) {
    let result: any = await buildFamilyTree(rootMemberId.id)
    data = result
  }
  
  const members = await prisma.familyMember.findMany();

  return (
    <FamilyTreeApp data={data} members={members} />
  )
}

export default NewDesign