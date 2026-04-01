import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id: athleteId } = await params;

  try {
    const body = await request.json();
    const { routineId } = body;

    if (!routineId) {
      return NextResponse.json({ error: 'routineId es requerido' }, { status: 400 });
    }

    const updatedAthlete = await prisma.user.update({
      where: { id: athleteId },
      data: {
        assignedRoutines: {
          connect: { id: routineId }
        }
      }
    });

    return NextResponse.json({ success: true, athlete: updatedAthlete }, { status: 200 });

  } catch (error) {
    console.error("Error asignando rutina:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}