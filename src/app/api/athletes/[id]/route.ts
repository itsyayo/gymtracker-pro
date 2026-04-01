// src/app/api/athletes/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id: athleteId } = await params;

  try {
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        profile: true,
        workoutSessions: {
          include: {
            sets: {
              include: { exercise: true }
            }
          },
          orderBy: { startedAt: 'desc' }
        }
      }
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Atleta no encontrado' }, { status: 404 });
    }

    return NextResponse.json(athlete, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo atleta:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}