-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "cursorId" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "userAuth" TEXT NOT NULL,
    "userMail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_cursorId_key" ON "api_keys"("cursorId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");
