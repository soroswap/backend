-- CreateTable
CREATE TABLE "Hello" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Hello_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "publicKey" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("publicKey")
);

-- CreateTable
CREATE TABLE "Token" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "issuer" TEXT NOT NULL DEFAULT 'Stellar',
    "stellarAsset" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "LiquidityPool" (
    "address" TEXT NOT NULL,
    "tokenAAddress" TEXT NOT NULL,
    "tokenBAddress" TEXT NOT NULL,

    CONSTRAINT "LiquidityPool_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "AddEvent" (
    "id" SERIAL NOT NULL,
    "userPublicKey" TEXT NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "amountA" INTEGER NOT NULL,
    "amountB" INTEGER NOT NULL,
    "liquidity" INTEGER NOT NULL,
    "ledger" INTEGER NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "AddEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoveEvent" (
    "id" SERIAL NOT NULL,
    "userPublicKey" TEXT NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "amountA" INTEGER NOT NULL,
    "amountB" INTEGER NOT NULL,
    "liquidity" INTEGER NOT NULL,
    "ledger" INTEGER NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "RemoveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwapEvent" (
    "id" SERIAL NOT NULL,
    "userPublicKey" TEXT NOT NULL,
    "amountIn" INTEGER NOT NULL,
    "amountOut" INTEGER NOT NULL,
    "tokenInAddress" TEXT NOT NULL,
    "tokenOutAddress" TEXT NOT NULL,
    "ledger" INTEGER NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "SwapEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwapEventPath" (
    "id" SERIAL NOT NULL,
    "swapEventId" INTEGER NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "amountIn" INTEGER NOT NULL,
    "amountOut" INTEGER NOT NULL,
    "tokenInAddress" TEXT NOT NULL,
    "tokenOutAddress" TEXT NOT NULL,

    CONSTRAINT "SwapEventPath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_name_key" ON "Token"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Token_code_key" ON "Token"("code");

-- AddForeignKey
ALTER TABLE "LiquidityPool" ADD CONSTRAINT "LiquidityPool_tokenAAddress_fkey" FOREIGN KEY ("tokenAAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidityPool" ADD CONSTRAINT "LiquidityPool_tokenBAddress_fkey" FOREIGN KEY ("tokenBAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddEvent" ADD CONSTRAINT "AddEvent_userPublicKey_fkey" FOREIGN KEY ("userPublicKey") REFERENCES "User"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddEvent" ADD CONSTRAINT "AddEvent_poolAddress_fkey" FOREIGN KEY ("poolAddress") REFERENCES "LiquidityPool"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoveEvent" ADD CONSTRAINT "RemoveEvent_userPublicKey_fkey" FOREIGN KEY ("userPublicKey") REFERENCES "User"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoveEvent" ADD CONSTRAINT "RemoveEvent_poolAddress_fkey" FOREIGN KEY ("poolAddress") REFERENCES "LiquidityPool"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEvent" ADD CONSTRAINT "SwapEvent_userPublicKey_fkey" FOREIGN KEY ("userPublicKey") REFERENCES "User"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEvent" ADD CONSTRAINT "SwapEvent_tokenInAddress_fkey" FOREIGN KEY ("tokenInAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEvent" ADD CONSTRAINT "SwapEvent_tokenOutAddress_fkey" FOREIGN KEY ("tokenOutAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEventPath" ADD CONSTRAINT "SwapEventPath_swapEventId_fkey" FOREIGN KEY ("swapEventId") REFERENCES "SwapEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEventPath" ADD CONSTRAINT "SwapEventPath_poolAddress_fkey" FOREIGN KEY ("poolAddress") REFERENCES "LiquidityPool"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEventPath" ADD CONSTRAINT "SwapEventPath_tokenInAddress_fkey" FOREIGN KEY ("tokenInAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEventPath" ADD CONSTRAINT "SwapEventPath_tokenOutAddress_fkey" FOREIGN KEY ("tokenOutAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
