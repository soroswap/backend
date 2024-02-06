/*
  Warnings:

  - A unique constraint covering the columns `[contractId]` on the table `FactorySubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FactoryPairIndexSubscription_contractId_key";

-- CreateIndex
CREATE UNIQUE INDEX "FactorySubscription_contractId_key" ON "FactorySubscription"("contractId");
