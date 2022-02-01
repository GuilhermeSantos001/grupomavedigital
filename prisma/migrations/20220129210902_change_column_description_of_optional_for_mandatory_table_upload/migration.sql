/*
  Warnings:

  - Made the column `description` on table `uploads` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "uploads" ALTER COLUMN "description" SET NOT NULL;
