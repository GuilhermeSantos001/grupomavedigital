/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `api_keys` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_title_key" ON "api_keys"("title");
