/*
  Warnings:

  - A unique constraint covering the columns `[id_symbol]` on the table `PriceData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PriceData_id_symbol_key" ON "PriceData"("id_symbol");
