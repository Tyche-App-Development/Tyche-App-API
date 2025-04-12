/*
  Warnings:

  - A unique constraint covering the columns `[nif]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nif` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "nif" VARCHAR(255) DEFAULT '000000000';

-- CreateIndex
CREATE UNIQUE INDEX "User_nif_key" ON "User"("nif");
