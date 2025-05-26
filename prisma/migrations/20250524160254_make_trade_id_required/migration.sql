/*
  Warnings:

  - Added the required column `pnl` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pnl" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "profit" DOUBLE PRECISION NOT NULL;
