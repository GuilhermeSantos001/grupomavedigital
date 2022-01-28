-- DropForeignKey
ALTER TABLE "person_coverage" DROP CONSTRAINT "person_coverage_mirrorId_fkey";

-- DropForeignKey
ALTER TABLE "person_covering" DROP CONSTRAINT "person_covering_mirrorId_fkey";

-- AddForeignKey
ALTER TABLE "person_covering" ADD CONSTRAINT "person_covering_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_coverage" ADD CONSTRAINT "person_coverage_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
