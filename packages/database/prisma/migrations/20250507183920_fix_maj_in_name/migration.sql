/*
  Warnings:

  - You are about to drop the `tradeexecution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "tradeexecution";

-- CreateTable
CREATE TABLE "Tradeexecution" (
    "id" TEXT NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "max_nav" DOUBLE PRECISION NOT NULL,
    "initial_capital" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Tradeexecution_pkey" PRIMARY KEY ("id")
);
