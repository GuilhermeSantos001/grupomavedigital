/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `person_covering` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "person_covering" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "person_covering_cursorId_key" ON "person_covering"("cursorId");
