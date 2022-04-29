/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `districts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "districts" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "districts_cursorId_key" ON "districts"("cursorId");
