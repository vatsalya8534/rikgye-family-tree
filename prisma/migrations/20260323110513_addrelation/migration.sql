/*
  Warnings:

  - You are about to drop the `Gallery` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('PARENT', 'CHILD', 'SPOUSE', 'STEP_CHILD', 'EX_SPOUSE');

-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "relation" TEXT;

-- DropTable
DROP TABLE "Gallery";
