/*
  Warnings:

  - The `attachments` column on the `Assignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "attachments",
ADD COLUMN     "attachments" JSONB[];
