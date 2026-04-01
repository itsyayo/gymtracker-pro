import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, history } = body;

    const athlete = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    });

    const profile = athlete?.profile;
    const context = profile 
      ? `Edad: ${profile.age}, Peso: ${profile.currentWeightKg}kg, Meta: ${profile.primaryGoal}, Lesiones: ${profile.medicalConditions || "Ninguna"}.`
      : "Sin datos médicos.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: `Eres un Entrenador Personal de Élite en la aplicación GymTracker Pro. Tu cliente es ${athlete?.name || "el atleta"}. Sus datos son: ${context}. Responde de manera motivacional, técnica, amigable y siempre priorizando evitar lesiones. Formatea tus respuestas de manera limpia (puedes usar negritas o listas). Sé conciso, no escribas biblias a menos que te pidan una rutina detallada.`
    });

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text }, { status: 200 });

  } catch (error) {
    console.error("Error en AI Chat:", error);
    return NextResponse.json({ error: 'Error al conectar con el Coach.' }, { status: 500 });
  }
}