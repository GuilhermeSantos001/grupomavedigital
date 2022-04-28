/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "services_cursorId_key" ON "services"("cursorId");
