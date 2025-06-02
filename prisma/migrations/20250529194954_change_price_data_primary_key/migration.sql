/*
  Warnings:

  - You are about to drop the column `symbol` on the `UserStrategy` table. All the data in the column will be lost.
  - Added the required column `id_symbol` to the `PriceData` table without a default value. This is not possible if the table is not empty.
  - Made the column `imageProfile` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PriceData" ADD COLUMN     "id_symbol" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "imageProfile" SET NOT NULL,
ALTER COLUMN "imageProfile" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserStrategy" DROP COLUMN "symbol";
