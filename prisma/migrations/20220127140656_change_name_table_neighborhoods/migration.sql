/*
  Warnings:

  - You are about to drop the `Neighborhoods` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_neighborhoodId_fkey";

-- DropTable
DROP TABLE "Neighborhoods";

-- CreateTable
CREATE TABLE "neighborhoods" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "neighborhoods_value_key" ON "neighborhoods"("value");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "neighborhoods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
