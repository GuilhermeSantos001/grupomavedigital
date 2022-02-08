/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `person_coverage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "person_coverage" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "person_coverage_cursorId_key" ON "person_coverage"("cursorId");
