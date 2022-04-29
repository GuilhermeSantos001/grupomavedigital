/*
  Warnings:

  - Added the required column `passphrase` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "passphrase" TEXT NOT NULL;
