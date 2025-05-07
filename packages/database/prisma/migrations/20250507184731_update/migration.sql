/*
  Warnings:

  - Added the required column `name` to the `Tradeexecution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risky_asset` to the `Tradeexecution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `safe_asset` to the `Tradeexecution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tradeexecution" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "risky_asset" TEXT NOT NULL,
ADD COLUMN     "safe_asset" TEXT NOT NULL;
