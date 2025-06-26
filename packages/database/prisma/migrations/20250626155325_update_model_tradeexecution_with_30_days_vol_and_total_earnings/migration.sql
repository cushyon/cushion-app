-- AlterTable
ALTER TABLE "Tradeexecution" ADD COLUMN     "thirty_days_vol" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0;
