/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `uploads` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "uploads" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "uploads_cursorId_key" ON "uploads"("cursorId");
