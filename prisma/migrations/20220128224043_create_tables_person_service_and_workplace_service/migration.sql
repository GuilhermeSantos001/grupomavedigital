/*
  Warnings:

  - You are about to drop the column `serviceId` on the `people` table. All the data in the column will be lost.
  - You are about to drop the column `WorkplaceId` on the `services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "people" DROP CONSTRAINT "people_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_WorkplaceId_fkey";

-- AlterTable
ALTER TABLE "people" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "WorkplaceId";

-- CreateTable
CREATE TABLE "people_service" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "people_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplaces_service" (
    "id" TEXT NOT NULL,
    "workplaceId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "workplaces_service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "people_service" ADD CONSTRAINT "people_service_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_service" ADD CONSTRAINT "people_service_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workplaces_service" ADD CONSTRAINT "workplaces_service_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "workplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workplaces_service" ADD CONSTRAINT "workplaces_service_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
