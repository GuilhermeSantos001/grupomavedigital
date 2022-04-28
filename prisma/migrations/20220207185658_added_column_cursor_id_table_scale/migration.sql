/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `scales` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "scales" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "scales_cursorId_key" ON "scales"("cursorId");
