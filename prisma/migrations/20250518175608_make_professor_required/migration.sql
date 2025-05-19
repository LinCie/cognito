/*
  Warnings:

  - Made the column `professorId` on table `Kelas` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Kelas" DROP CONSTRAINT "Kelas_professorId_fkey";

-- AlterTable
ALTER TABLE "Kelas" ALTER COLUMN "professorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
