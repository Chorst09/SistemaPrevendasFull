/*
  Warnings:

  - You are about to drop the column `baseSalary` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `benefits` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `team_members` table. All the data in the column will be lost.
  - Added the required column `jobPositionId` to the `team_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "team_members" DROP COLUMN "baseSalary",
DROP COLUMN "benefits",
DROP COLUMN "level",
DROP COLUMN "role",
ADD COLUMN     "jobPositionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "job_positions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "salary8h" DOUBLE PRECISION NOT NULL,
    "salary6h" DOUBLE PRECISION,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_positions_name_key" ON "job_positions"("name");

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "job_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
