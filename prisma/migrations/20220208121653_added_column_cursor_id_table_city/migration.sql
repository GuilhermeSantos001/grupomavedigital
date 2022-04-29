/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `cities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cities_cursorId_key" ON "cities"("cursorId");
