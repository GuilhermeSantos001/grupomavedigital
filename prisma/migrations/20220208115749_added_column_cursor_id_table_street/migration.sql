/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `streets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "streets" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "streets_cursorId_key" ON "streets"("cursorId");
