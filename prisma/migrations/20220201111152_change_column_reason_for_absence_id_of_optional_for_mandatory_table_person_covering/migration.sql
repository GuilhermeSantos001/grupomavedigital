/*
  Warnings:

  - Made the column `reasonForAbsenceId` on table `person_covering` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "person_covering" DROP CONSTRAINT "person_covering_reasonForAbsenceId_fkey";

-- AlterTable
ALTER TABLE "person_covering" ALTER COLUMN "reasonForAbsenceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "person_covering" ADD CONSTRAINT "person_covering_reasonForAbsenceId_fkey" FOREIGN KEY ("reasonForAbsenceId") REFERENCES "reason_for_absences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
