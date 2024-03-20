-- CreateTable
CREATE TABLE "XlmUsdPrice" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XlmUsdPrice_pkey" PRIMARY KEY ("id")
);
