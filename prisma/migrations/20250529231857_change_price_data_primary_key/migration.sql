/*
  Warnings:

  - You are about to drop the column `coinAmount` on the `UserStrategy` table. All the data in the column will be lost.
  - Added the required column `currentBalance` to the `UserStrategy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialBalance` to the `UserStrategy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserStrategy" DROP COLUMN "coinAmount",
ADD COLUMN     "currentBalance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "initialBalance" DOUBLE PRECISION NOT NULL;
