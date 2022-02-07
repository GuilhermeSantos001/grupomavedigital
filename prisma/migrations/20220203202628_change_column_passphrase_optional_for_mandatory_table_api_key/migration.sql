/*
  Warnings:

  - A unique constraint covering the columns `[passphrase]` on the table `api_keys` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "api_keys_passphrase_key" ON "api_keys"("passphrase");
