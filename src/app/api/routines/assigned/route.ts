import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const assignedRoutines = await prisma.routine.findMany({
      where: {
        assignedToUsers: {
          some: {
            id: session.user.id
          }
        }
      },
      include: {
        author: {
          select: { name: true }
        },
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json(assignedRoutines, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo rutinas asignadas:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}