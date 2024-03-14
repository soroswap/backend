-- CreateEnum
CREATE TYPE "Network" AS ENUM ('TESTNET', 'MAINNET');

-- AlterTable
ALTER TABLE "Subscriptions" ADD COLUMN     "network" "Network" NOT NULL DEFAULT 'TESTNET';

-- CreateIndex
CREATE INDEX "Subscriptions_network_protocol_contractType_idx" ON "Subscriptions"("network", "protocol", "contractType");
