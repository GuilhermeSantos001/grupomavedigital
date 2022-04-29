/*
  Warnings:

  - Added the required column `personId` to the `person_covering` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "person_coverage" ADD COLUMN     "personId" TEXT;

-- AlterTable
ALTER TABLE "person_covering" ADD COLUMN     "personId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "person_covering" ADD CONSTRAINT "person_covering_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_coverage" ADD CONSTRAINT "person_coverage_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
