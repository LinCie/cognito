/*
  Warnings:

  - You are about to drop the column `name` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentNumber` on the `Student` table. All the data in the column will be lost.
  - Added the required column `number` to the `Professor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Professor" DROP COLUMN "name",
ADD COLUMN     "number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "name",
DROP COLUMN "studentNumber",
ADD COLUMN     "number" TEXT NOT NULL;
