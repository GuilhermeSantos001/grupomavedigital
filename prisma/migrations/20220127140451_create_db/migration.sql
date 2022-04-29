-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scales" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "WorkplaceId" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reason_for_absences" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "reason_for_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streets" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "streets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Neighborhoods" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "streetId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "complement" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "zipCode" INTEGER NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "lastCardNumber" INTEGER NOT NULL,
    "personId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "matricule" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" INTEGER NOT NULL,
    "rg" INTEGER NOT NULL,
    "motherName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "phone" INTEGER NOT NULL,
    "mail" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workplaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "compressedSize" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "temporary" BOOLEAN NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_covering" (
    "id" TEXT NOT NULL,
    "mirrorId" TEXT NOT NULL,
    "reasonForAbsenceId" TEXT,

    CONSTRAINT "person_covering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_coverage" (
    "id" TEXT NOT NULL,
    "mirrorId" TEXT,
    "modalityOfCoverage" TEXT NOT NULL,

    CONSTRAINT "person_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postings" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "originDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "coveringId" TEXT,
    "coverageId" TEXT NOT NULL,
    "reasonForAbsenceId" TEXT,
    "coveringWorkplaceId" TEXT NOT NULL,
    "coverageWorkplaceId" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "paymentValue" INTEGER NOT NULL,
    "paymentDatePayable" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentDatePaid" TIMESTAMP(3),
    "paymentDateCancelled" TIMESTAMP(3),
    "foremanApproval" BOOLEAN,
    "managerApproval" BOOLEAN,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scales_value_key" ON "scales"("value");

-- CreateIndex
CREATE UNIQUE INDEX "services_value_key" ON "services"("value");

-- CreateIndex
CREATE UNIQUE INDEX "reason_for_absences_value_key" ON "reason_for_absences"("value");

-- CreateIndex
CREATE UNIQUE INDEX "streets_value_key" ON "streets"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Neighborhoods_value_key" ON "Neighborhoods"("value");

-- CreateIndex
CREATE UNIQUE INDEX "cities_value_key" ON "cities"("value");

-- CreateIndex
CREATE UNIQUE INDEX "districts_value_key" ON "districts"("value");

-- CreateIndex
CREATE UNIQUE INDEX "cards_serialNumber_key" ON "cards"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "uploads_fileId_key" ON "uploads"("fileId");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_WorkplaceId_fkey" FOREIGN KEY ("WorkplaceId") REFERENCES "workplaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "streets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhoods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workplaces" ADD CONSTRAINT "workplaces_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_covering" ADD CONSTRAINT "person_covering_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_covering" ADD CONSTRAINT "person_covering_reasonForAbsenceId_fkey" FOREIGN KEY ("reasonForAbsenceId") REFERENCES "reason_for_absences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_coverage" ADD CONSTRAINT "person_coverage_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coveringId_fkey" FOREIGN KEY ("coveringId") REFERENCES "person_covering"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "person_coverage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_reasonForAbsenceId_fkey" FOREIGN KEY ("reasonForAbsenceId") REFERENCES "reason_for_absences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coveringWorkplaceId_fkey" FOREIGN KEY ("coveringWorkplaceId") REFERENCES "workplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coverageWorkplaceId_fkey" FOREIGN KEY ("coverageWorkplaceId") REFERENCES "workplaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
