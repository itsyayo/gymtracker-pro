import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET: Obtener las rutinas creadas por el Coach actual
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const routines = await prisma.routine.findMany({
      where: { authorId: session.user.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(routines, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo rutinas:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva plantilla de Rutina
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, exercises } = body;

    if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json({ error: 'Nombre y al menos un ejercicio son obligatorios' }, { status: 400 });
    }

    // Creación transaccional con Prisma (Rutina + RutinaEjercicios)
    const newRoutine = await prisma.routine.create({
      data: {
        name,
        description: description || null,
        authorId: session.user.id,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            exerciseId: ex.exerciseId,
            orderIndex: index, 
            targetSets: Number(ex.targetSets),
            targetReps: ex.targetReps, 
            targetRPE: ex.targetRPE ? Number(ex.targetRPE) : null,
          }))
        }
      },
      include: {
        exercises: true
      }
    });

    return NextResponse.json(newRoutine, { status: 201 });

  } catch (error) {
    console.error("Error creando rutina:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}