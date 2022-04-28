-- CreateTable
CREATE TABLE "person_b2" (
    "id" TEXT NOT NULL,
    "cursorId" SERIAL NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_b2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2" (
    "id" TEXT NOT NULL,
    "cursorId" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "personId" TEXT NOT NULL,
    "workplaceOriginId" TEXT NOT NULL,
    "workplaceDestinationId" TEXT NOT NULL,
    "coverageStartedAt" TIMESTAMP(3) NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3) NOT NULL,
    "valueClosed" INTEGER NOT NULL,
    "absences" INTEGER NOT NULL,
    "lawdays" INTEGER NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "gratification" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentValue" INTEGER NOT NULL,
    "paymentDatePayable" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentDatePaid" TIMESTAMP(3),
    "paymentDateCancelled" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_b2_cursorId_key" ON "person_b2"("cursorId");

-- CreateIndex
CREATE UNIQUE INDEX "b2_cursorId_key" ON "b2"("cursorId");

-- AddForeignKey
ALTER TABLE "person_b2" ADD CONSTRAINT "person_b2_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2" ADD CONSTRAINT "b2_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2" ADD CONSTRAINT "b2_workplaceOriginId_fkey" FOREIGN KEY ("workplaceOriginId") REFERENCES "workplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2" ADD CONSTRAINT "b2_workplaceDestinationId_fkey" FOREIGN KEY ("workplaceDestinationId") REFERENCES "workplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2" ADD CONSTRAINT "b2_personId_fkey" FOREIGN KEY ("personId") REFERENCES "person_b2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
