/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `cards` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cards_cursorId_key" ON "cards"("cursorId");
