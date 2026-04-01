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
    const { athleteNotes, sets } = body;

    if (!sets || sets.length === 0) {
      return NextResponse.json({ error: 'El entrenamiento está vacío' }, { status: 400 });
    }

    // Guardamos la sesión
    const newWorkout = await prisma.workoutSession.create({
      data: {
        athleteId: session.user.id,
        athleteNotes: athleteNotes || null,
        endedAt: new Date(),
        sets: {
          create: sets.map((s: any, index: number) => ({
            exerciseId: s.exerciseId,
            setNumber: index + 1,
            weightKg: Number(s.weightKg),
            reps: Number(s.reps),
            rpe: s.rpe ? Number(s.rpe) : null,
            estimated1RM: s.estimated1RM ? Number(s.estimated1RM) : null,
          }))
        }
      }
    });

    return NextResponse.json(newWorkout, { status: 201 });

  } catch (error) {
    console.error("Error guardando entrenamiento:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const history = await prisma.workoutSession.findMany({
      where: { 
        athleteId: session.user.id 
      },
      include: {
        sets: {
          include: { 
            exercise: true 
          },
          orderBy: { 
            setNumber: 'asc' 
          }
        }
      },
      orderBy: { 
        endedAt: 'desc' 
      }
    });

    return NextResponse.json(history, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}