/*
  Warnings:

  - A unique constraint covering the columns `[cursorId]` on the table `workplaces` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "workplaces" ADD COLUMN     "cursorId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "workplaces_cursorId_key" ON "workplaces"("cursorId");
