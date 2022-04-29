/*
  Warnings:

  - A unique constraint covering the columns `[mirrorId]` on the table `person_coverage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mirrorId]` on the table `person_covering` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "person_coverage_mirrorId_key" ON "person_coverage"("mirrorId");

-- CreateIndex
CREATE UNIQUE INDEX "person_covering_mirrorId_key" ON "person_covering"("mirrorId");
