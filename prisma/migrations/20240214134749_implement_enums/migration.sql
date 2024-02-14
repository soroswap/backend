/*
  Warnings:

  - The `protocol` column on the `Subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contractType` column on the `Subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `storageType` column on the `Subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Protocol" AS ENUM ('SOROSWAP', 'PHOENIX');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FACTORY', 'PAIR');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('INSTANCE', 'PERSISTENT');

-- AlterTable
ALTER TABLE "Subscriptions" DROP COLUMN "protocol",
ADD COLUMN     "protocol" "Protocol",
DROP COLUMN "contractType",
ADD COLUMN     "contractType" "ContractType",
DROP COLUMN "storageType",
ADD COLUMN     "storageType" "StorageType";
