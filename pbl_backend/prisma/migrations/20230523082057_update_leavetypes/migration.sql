/*
  Warnings:

  - Added the required column `balance` to the `LeaveTypes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LeaveTypes" ADD COLUMN     "balance" INTEGER NOT NULL;