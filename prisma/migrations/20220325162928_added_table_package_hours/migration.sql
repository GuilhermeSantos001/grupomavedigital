-- CreateTable
CREATE TABLE "person_ph" (
    "id" TEXT NOT NULL,
    "cursorId" SERIAL NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_ph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_hours" (
    "id" TEXT NOT NULL,
    "cursorId" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "personId" TEXT NOT NULL,
    "workplacePHDestinationId" TEXT NOT NULL,
    "contractStartedAt" TIMESTAMP(3) NOT NULL,
    "contractFinishAt" TIMESTAMP(3) NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3) NOT NULL,
    "valueClosed" DOUBLE PRECISION NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "lawdays" INTEGER NOT NULL,
    "onlyHistory" BOOLEAN NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentValue" DOUBLE PRECISION NOT NULL,
    "paymentDatePayable" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentDatePaid" TIMESTAMP(3),
    "paymentDateCancelled" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_ph_cursorId_key" ON "person_ph"("cursorId");

-- CreateIndex
CREATE UNIQUE INDEX "package_hours_cursorId_key" ON "package_hours"("cursorId");

-- AddForeignKey
ALTER TABLE "person_ph" ADD CONSTRAINT "person_ph_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_hours" ADD CONSTRAINT "package_hours_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_hours" ADD CONSTRAINT "package_hours_workplacePHDestinationId_fkey" FOREIGN KEY ("workplacePHDestinationId") REFERENCES "workplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_hours" ADD CONSTRAINT "package_hours_personId_fkey" FOREIGN KEY ("personId") REFERENCES "person_ph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
