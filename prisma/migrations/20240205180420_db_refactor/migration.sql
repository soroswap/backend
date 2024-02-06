/*
  Warnings:

  - You are about to drop the `AddEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LiquidityPool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RemoveEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SwapEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SwapEventPath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddEvent" DROP CONSTRAINT "AddEvent_poolAddress_fkey";

-- DropForeignKey
ALTER TABLE "AddEvent" DROP CONSTRAINT "AddEvent_userPublicKey_fkey";

-- DropForeignKey
ALTER TABLE "LiquidityPool" DROP CONSTRAINT "LiquidityPool_tokenAAddress_fkey";

-- DropForeignKey
ALTER TABLE "LiquidityPool" DROP CONSTRAINT "LiquidityPool_tokenBAddress_fkey";

-- DropForeignKey
ALTER TABLE "RemoveEvent" DROP CONSTRAINT "RemoveEvent_poolAddress_fkey";

-- DropForeignKey
ALTER TABLE "RemoveEvent" DROP CONSTRAINT "RemoveEvent_userPublicKey_fkey";

-- DropForeignKey
ALTER TABLE "SwapEvent" DROP CONSTRAINT "SwapEvent_tokenInAddress_fkey";

-- DropForeignKey
ALTER TABLE "SwapEvent" DROP CONSTRAINT "SwapEvent_tokenOutAddress_fkey";

-- DropForeignKey
ALTER TABLE "SwapEvent" DROP CONSTRAINT "SwapEvent_userPublicKey_fkey";

-- DropForeignKey
ALTER TABLE "SwapEventPath" DROP CONSTRAINT "SwapEventPath_poolAddress_fkey";

-- DropForeignKey
ALTER TABLE "SwapEventPath" DROP CONSTRAINT "SwapEventPath_swapEventId_fkey";

-- DropForeignKey
ALTER TABLE "SwapEventPath" DROP CONSTRAINT "SwapEventPath_tokenInAddress_fkey";

-- DropForeignKey
ALTER TABLE "SwapEventPath" DROP CONSTRAINT "SwapEventPath_tokenOutAddress_fkey";

-- DropTable
DROP TABLE "AddEvent";

-- DropTable
DROP TABLE "LiquidityPool";

-- DropTable
DROP TABLE "RemoveEvent";

-- DropTable
DROP TABLE "SwapEvent";

-- DropTable
DROP TABLE "SwapEventPath";

-- DropTable
DROP TABLE "Token";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "FactorySubscription" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'soroswap',

    CONSTRAINT "FactorySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryPairIndexSubscription" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "keyXdr" TEXT NOT NULL,

    CONSTRAINT "FactoryPairIndexSubscription_pkey" PRIMARY KEY ("id")
);
