import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET: Obtener el catálogo de ejercicios
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(exercises, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo ejercicios:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear un nuevo ejercicio
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de COACH.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, muscleGroup, videoUrl, activityType } = body;

    if (!name || !muscleGroup) {
      return NextResponse.json({ error: 'Nombre y Grupo Muscular son obligatorios' }, { status: 400 });
    }

    const newExercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        videoUrl: videoUrl || null,
        activityType: activityType || 'STRENGTH' // <-- Agregamos esto
      }
    });

    return NextResponse.json(newExercise, { status: 201 });

  } catch (error) {
    console.error("Error creando ejercicio:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}