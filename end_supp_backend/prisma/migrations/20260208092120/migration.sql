/*
  Warnings:

  - Added the required column `sprintNumber` to the `backlog_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "backlog_items" ADD COLUMN     "sprintNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
