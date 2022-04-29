/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `reason_for_absences` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reason_for_absences" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reason_for_absences_cursorId_key" ON "reason_for_absences"("cursorId");
