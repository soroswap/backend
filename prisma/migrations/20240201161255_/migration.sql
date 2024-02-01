-- CreateTable
CREATE TABLE "PairSubscription" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "keyXdr" TEXT NOT NULL,

    CONSTRAINT "PairSubscription_pkey" PRIMARY KEY ("id")
);
