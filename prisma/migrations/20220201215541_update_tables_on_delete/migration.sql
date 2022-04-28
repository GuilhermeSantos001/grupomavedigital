-- DropForeignKey
ALTER TABLE "person_coverage" DROP CONSTRAINT "person_coverage_mirrorId_fkey";

-- DropForeignKey
ALTER TABLE "person_covering" DROP CONSTRAINT "person_covering_mirrorId_fkey";

-- DropForeignKey
ALTER TABLE "postings" DROP CONSTRAINT "postings_coverageId_fkey";

-- DropForeignKey
ALTER TABLE "postings" DROP CONSTRAINT "postings_coveringId_fkey";

-- AddForeignKey
ALTER TABLE "person_covering" ADD CONSTRAINT "person_covering_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_coverage" ADD CONSTRAINT "person_coverage_mirrorId_fkey" FOREIGN KEY ("mirrorId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "person_coverage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coveringId_fkey" FOREIGN KEY ("coveringId") REFERENCES "person_covering"("id") ON DELETE SET NULL ON UPDATE CASCADE;
