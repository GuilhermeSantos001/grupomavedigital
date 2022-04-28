/*
  Warnings:

  - You are about to drop the column `reasonForAbsenceId` on the `postings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "postings" DROP CONSTRAINT "postings_reasonForAbsenceId_fkey";

-- AlterTable
ALTER TABLE "postings" DROP COLUMN "reasonForAbsenceId";
