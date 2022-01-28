/*
  Warnings:

  - You are about to drop the column `title` on the `cost_centers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[value]` on the table `cost_centers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `cost_centers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cost_centers_title_key";

-- AlterTable
ALTER TABLE "cost_centers" DROP COLUMN "title",
ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "people" ALTER COLUMN "cpf" SET DATA TYPE TEXT,
ALTER COLUMN "rg" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_value_key" ON "cost_centers"("value");
