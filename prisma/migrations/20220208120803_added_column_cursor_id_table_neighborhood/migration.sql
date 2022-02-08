/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `neighborhoods` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "neighborhoods" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "neighborhoods_cursorId_key" ON "neighborhoods"("cursorId");
