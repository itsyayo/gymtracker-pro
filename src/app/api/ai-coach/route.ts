import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const athlete = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    });

    if (!athlete || !athlete.profile) {
      return NextResponse.json({ advice: "Aún no has completado tu perfil médico. Complétalo para recibir consejos de la IA." });
    }

    const { age, currentWeightKg, medicalConditions, primaryGoal, targetWeightKg } = athlete.profile;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Actúa como un Coach de Fitness y Salud experto. 
      Tu cliente es ${athlete.name}, tiene ${age} años y pesa ${currentWeightKg}kg.
      Su meta principal es: ${primaryGoal}. 
      Su peso objetivo es: ${targetWeightKg}kg.
      Condiciones médicas o lesiones a considerar: ${medicalConditions || "Ninguna"}.

      Basado en estos datos, dale un consejo técnico o motivacional corto (máximo 3 líneas). 
      No saludes por su nombre, ve directo al consejo profesional. 
      Si tiene lesiones, prioriza la seguridad.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ advice: text });

  } catch (error) {
    console.error("Error en AI Coach:", error);
    return NextResponse.json({ advice: "El Coach está descansando. Intenta de nuevo más tarde." });
  }
}