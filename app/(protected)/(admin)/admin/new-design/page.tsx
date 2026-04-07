import FamilyTreeApp from '@/components/new-design/FamilyTreeApp'
import { buildFamilyTree, getFamilyMembers } from '@/lib/actions/family-member'
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

  console.log(data);
  
  const members = await prisma.familyMember.findMany();

  return (
    <FamilyTreeApp data={data} members={members} />
  )
}

export default NewDesign