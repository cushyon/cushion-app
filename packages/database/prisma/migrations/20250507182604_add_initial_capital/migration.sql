-- CreateTable
CREATE TABLE "tradeexecution" (
    "id" TEXT NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "max_nav" DOUBLE PRECISION NOT NULL,
    "initial_capital" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "tradeexecution_pkey" PRIMARY KEY ("id")
);
