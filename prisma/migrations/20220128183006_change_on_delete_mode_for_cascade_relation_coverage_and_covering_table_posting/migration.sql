-- DropForeignKey
ALTER TABLE "postings" DROP CONSTRAINT "postings_coverageId_fkey";

-- DropForeignKey
ALTER TABLE "postings" DROP CONSTRAINT "postings_coveringId_fkey";

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "person_coverage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postings" ADD CONSTRAINT "postings_coveringId_fkey" FOREIGN KEY ("coveringId") REFERENCES "person_covering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
