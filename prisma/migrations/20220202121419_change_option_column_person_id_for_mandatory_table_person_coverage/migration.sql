/*
  Warnings:

  - Made the column `personId` on table `person_coverage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "person_coverage" DROP CONSTRAINT "person_coverage_personId_fkey";

-- AlterTable
ALTER TABLE "person_coverage" ALTER COLUMN "personId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "person_coverage" ADD CONSTRAINT "person_coverage_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
