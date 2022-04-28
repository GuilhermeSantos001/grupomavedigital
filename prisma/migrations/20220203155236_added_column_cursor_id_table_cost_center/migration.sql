/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `cost_centers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cost_centers" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_cursorId_key" ON "cost_centers"("cursorId");
