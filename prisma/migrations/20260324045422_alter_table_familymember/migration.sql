/*
  Warnings:

  - The values [PARENT] on the enum `Relationship` will be removed. If these variants are still used in the database, this will fail.
  - The `image` column on the `family_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Relationship_new" AS ENUM ('FATHER', 'MOTHER', 'CHILD', 'STEP_CHILD', 'SPOUSE', 'EX_SPOUSE');
ALTER TYPE "Relationship" RENAME TO "Relationship_old";
ALTER TYPE "Relationship_new" RENAME TO "Relationship";
DROP TYPE "public"."Relationship_old";
COMMIT;

-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "spouseId" UUID,
DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];

-- CreateIndex
CREATE INDEX "family_members_spouseId_idx" ON "family_members"("spouseId");

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
