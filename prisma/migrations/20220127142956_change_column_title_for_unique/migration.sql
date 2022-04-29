/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `cost_centers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_title_key" ON "cost_centers"("title");
