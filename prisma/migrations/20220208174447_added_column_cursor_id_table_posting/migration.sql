/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `postings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "postings" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "postings_cursorId_key" ON "postings"("cursorId");
