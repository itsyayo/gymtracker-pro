import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const athletes = await prisma.user.findMany({
      where: { 
        coachId: session.user.id,
        role: 'ATHLETE' 
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { workoutSessions: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(athletes, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo atletas:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}