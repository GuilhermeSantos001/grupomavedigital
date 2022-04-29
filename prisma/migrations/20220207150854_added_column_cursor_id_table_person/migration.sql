/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `people` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "people" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "people_cursorId_key" ON "people"("cursorId");
