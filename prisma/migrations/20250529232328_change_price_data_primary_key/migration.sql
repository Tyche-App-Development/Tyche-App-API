-- AlterTable
ALTER TABLE "UserStrategy" ADD COLUMN     "amountHeld" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inPosition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAction" TEXT;
