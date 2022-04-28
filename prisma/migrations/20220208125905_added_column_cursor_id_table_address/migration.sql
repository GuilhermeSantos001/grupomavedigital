/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "addresses_cursorId_key" ON "addresses"("cursorId");
