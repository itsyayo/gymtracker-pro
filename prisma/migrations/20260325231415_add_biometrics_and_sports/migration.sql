-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('STRENGTH', 'CARDIO', 'SWIMMING', 'OTHER');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "activityType" "ActivityType" NOT NULL DEFAULT 'STRENGTH';

-- AlterTable
ALTER TABLE "SetLog" ADD COLUMN     "distanceMeters" DOUBLE PRECISION,
ADD COLUMN     "durationSeconds" INTEGER,
ALTER COLUMN "weightKg" DROP NOT NULL,
ALTER COLUMN "reps" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AthleteProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "heightCm" DOUBLE PRECISION,
    "currentWeightKg" DOUBLE PRECISION,
    "medicalConditions" TEXT,
    "primaryGoal" TEXT,
    "targetWeightKg" DOUBLE PRECISION,
    "targetWaistCm" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AthleteProfile_userId_key" ON "AthleteProfile"("userId");

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
