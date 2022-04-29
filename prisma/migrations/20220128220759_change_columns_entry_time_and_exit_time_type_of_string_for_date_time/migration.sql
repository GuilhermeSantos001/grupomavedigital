/*
  Warnings:

  - Changed the type of `entryTime` on the `workplaces` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `exitTime` on the `workplaces` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "workplaces" DROP COLUMN "entryTime",
ADD COLUMN     "entryTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "exitTime",
ADD COLUMN     "exitTime" TIMESTAMP(3) NOT NULL;
