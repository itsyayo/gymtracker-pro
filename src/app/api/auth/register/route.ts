import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: role || 'ATHLETE', 
      }
    });

    const { passwordHash, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}