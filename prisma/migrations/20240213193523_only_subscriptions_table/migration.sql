/*
  Warnings:

  - You are about to drop the `FactoryPairIndexSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FactorySubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PairSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FactoryPairIndexSubscription";

-- DropTable
DROP TABLE "FactorySubscription";

-- DropTable
DROP TABLE "PairSubscription";

-- CreateTable
CREATE TABLE "Subscriptions" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "keyXdr" TEXT NOT NULL,
    "protocol" TEXT,
    "contractType" TEXT,
    "storageType" TEXT,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_contractId_keyXdr_key" ON "Subscriptions"("contractId", "keyXdr");
