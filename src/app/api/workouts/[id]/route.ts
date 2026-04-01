import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const workout = await prisma.workoutSession.findUnique({
      where: { id: id },
      include: {
        athlete: {
          select: { id: true, name: true, coachId: true }
        },
        sets: {
          include: { exercise: true }
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Entrenamiento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(workout, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo el entrenamiento:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}