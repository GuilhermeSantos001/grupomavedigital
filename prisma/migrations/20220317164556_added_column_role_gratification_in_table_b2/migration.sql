/*
  Warnings:

  - Added the required column `roleGratification` to the `b2` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "b2" ADD COLUMN     "roleGratification" TEXT NOT NULL;
