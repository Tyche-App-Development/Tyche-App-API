-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "imageProfile" BYTEA,
    "nif" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryTrade" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" INTEGER NOT NULL,
    "quoteQuantity" DOUBLE PRECISION NOT NULL,
    "gain_loss" DOUBLE PRECISION NOT NULL,
    "isBuyer" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceData" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "ma_7" DOUBLE PRECISION NOT NULL,
    "ma_25" DOUBLE PRECISION NOT NULL,
    "ma_99" DOUBLE PRECISION NOT NULL,
    "rsi" DOUBLE PRECISION NOT NULL,
    "macd" DOUBLE PRECISION NOT NULL,
    "dea" DOUBLE PRECISION NOT NULL,
    "diff" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PriceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStrategy" (
    "id" SERIAL NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_bot" INTEGER NOT NULL,
    "id_priceData" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "buy_price" DOUBLE PRECISION NOT NULL,
    "coinAmount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" SERIAL NOT NULL,
    "strategyName" TEXT NOT NULL,
    "strategyRisk" TEXT NOT NULL,
    "strategyDescription" TEXT NOT NULL,
    "timeInterval" TEXT NOT NULL,
    "defaultMaShort" DOUBLE PRECISION NOT NULL,
    "defaultMaMid" DOUBLE PRECISION NOT NULL,
    "defaultMaLong" DOUBLE PRECISION NOT NULL,
    "defaultRSIPeriod" DOUBLE PRECISION NOT NULL,
    "defaultMacdFast" DOUBLE PRECISION NOT NULL,
    "defaultMacdSlow" DOUBLE PRECISION NOT NULL,
    "defaultMacdSignal" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nif_key" ON "User"("nif");

-- AddForeignKey
ALTER TABLE "HistoryTrade" ADD CONSTRAINT "HistoryTrade_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStrategy" ADD CONSTRAINT "UserStrategy_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStrategy" ADD CONSTRAINT "UserStrategy_id_bot_fkey" FOREIGN KEY ("id_bot") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStrategy" ADD CONSTRAINT "UserStrategy_id_priceData_fkey" FOREIGN KEY ("id_priceData") REFERENCES "PriceData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
