/*
  Warnings:

  - A unique constraint covering the columns `[contractId,keyXdr]` on the table `FactoryPairIndexSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contractId,keyXdr]` on the table `PairSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FactoryPairIndexSubscription_contractId_keyXdr_key" ON "FactoryPairIndexSubscription"("contractId", "keyXdr");

-- CreateIndex
CREATE UNIQUE INDEX "PairSubscription_contractId_keyXdr_key" ON "PairSubscription"("contractId", "keyXdr");
