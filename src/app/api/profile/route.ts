import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      age, heightCm, currentWeightKg, medicalConditions, 
      primaryGoal, targetWeightKg, targetWaistCm 
    } = body;

    const profile = await prisma.athleteProfile.upsert({
      where: { userId: session.user.id },
      update: {
        age: age ? Number(age) : null,
        heightCm: heightCm ? Number(heightCm) : null,
        currentWeightKg: currentWeightKg ? Number(currentWeightKg) : null,
        medicalConditions,
        primaryGoal,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
        targetWaistCm: targetWaistCm ? Number(targetWaistCm) : null,
      },
      create: {
        userId: session.user.id,
        age: age ? Number(age) : null,
        heightCm: heightCm ? Number(heightCm) : null,
        currentWeightKg: currentWeightKg ? Number(currentWeightKg) : null,
        medicalConditions,
        primaryGoal,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
        targetWaistCm: targetWaistCm ? Number(targetWaistCm) : null,
      }
    });

    return NextResponse.json(profile, { status: 200 });

  } catch (error) {
    console.error("Error guardando perfil:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
