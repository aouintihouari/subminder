-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailChangeExpires" TIMESTAMP(3),
ADD COLUMN     "emailChangeToken" TEXT,
ADD COLUMN     "newEmail" TEXT;
