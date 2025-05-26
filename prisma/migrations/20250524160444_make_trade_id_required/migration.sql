/*
  Warnings:

  - Made the column `pnl` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profit` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "pnl" SET NOT NULL,
ALTER COLUMN "pnl" SET DEFAULT 0,
ALTER COLUMN "profit" SET NOT NULL,
ALTER COLUMN "profit" SET DEFAULT 0;
