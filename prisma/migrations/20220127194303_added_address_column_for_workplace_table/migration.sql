/*
  Warnings:

  - Added the required column `addressId` to the `workplaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workplaces" ADD COLUMN     "addressId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "workplaces" ADD CONSTRAINT "workplaces_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
