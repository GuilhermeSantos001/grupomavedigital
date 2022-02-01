/*
  Warnings:

  - You are about to alter the column `size` on the `uploads` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `compressedSize` on the `uploads` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "uploads" ALTER COLUMN "size" SET DATA TYPE INTEGER,
ALTER COLUMN "compressedSize" SET DATA TYPE INTEGER;
