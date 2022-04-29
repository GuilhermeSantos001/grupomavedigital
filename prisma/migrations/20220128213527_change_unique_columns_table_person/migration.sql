/*
  Warnings:

  - A unique constraint covering the columns `[matricule]` on the table `people` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `people` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rg]` on the table `people` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `people` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mail]` on the table `people` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "people_matricule_key" ON "people"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "people_cpf_key" ON "people"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "people_rg_key" ON "people"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "people_phone_key" ON "people"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "people_mail_key" ON "people"("mail");
