/*
  Warnings:

  - You are about to drop the column `userAuth` on the `api_keys` table. All the data in the column will be lost.
  - Added the required column `username` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "userAuth",
ADD COLUMN     "username" TEXT NOT NULL;
