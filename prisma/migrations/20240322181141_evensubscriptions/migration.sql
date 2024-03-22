-- CreateTable
CREATE TABLE "EventSubscriptions" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "maxSingleSize" TEXT,
    "topic1" TEXT,
    "topic2" TEXT,
    "topic3" TEXT,
    "topic4" TEXT,
    "network" "Network" NOT NULL DEFAULT 'TESTNET',

    CONSTRAINT "EventSubscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventSubscriptions_network_topic1_topic2_contractId_idx" ON "EventSubscriptions"("network", "topic1", "topic2", "contractId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSubscriptions_contractId_maxSingleSize_key" ON "EventSubscriptions"("contractId", "maxSingleSize");
